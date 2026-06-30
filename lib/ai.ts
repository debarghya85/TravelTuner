import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_CANDIDATES = (
  process.env.GEMINI_MODEL_FALLBACKS?.split(",") ?? [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-1.5-flash",
  ]
)
  .map((model) => model.trim())
  .filter(Boolean);

function getModel(modelName: string) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 32768,
      responseMimeType: "application/json",
    },
  });
}

function parseJsonResponse(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Invalid JSON response");
  }

  return JSON.parse(text.substring(start, end + 1));
}

function hasExpectedDays(payload: any, expectedDays?: number) {
  if (!expectedDays || expectedDays <= 0) {
    return true;
  }

  return Array.isArray(payload?.days) && payload.days.length >= expectedDays;
}

async function generateJson(prompt: string) {
  let lastError: unknown;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = getModel(modelName);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      console.log(`RAW AI (${modelName}):`, text);

      return parseJsonResponse(text);
    } catch (error: any) {
      lastError = error;
      const status = error?.status;
      const retryable = status === 429 || status === 503 || status === 504;

      if (!retryable) {
        throw error;
      }

      console.warn(
        `AI model ${modelName} failed with ${status ?? "unknown"}. Trying next fallback model.`,
      );
    }
  }

  throw lastError;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateJsonWithRetry(prompt: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await generateJson(prompt);
    } catch (error: any) {
      lastError = error;
      const status = error?.status;
      const retryable = status === 429 || status === 503 || status === 504;

      if (!retryable || attempt === attempts) {
        throw error;
      }

      const delay = 500 * attempt * attempt;
      console.warn(
        `AI request failed with ${status ?? "unknown"} on attempt ${attempt}. Retrying in ${delay}ms.`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

export async function callAI(prompt: string, expectedDays?: number) {
  try {
    const firstResponse = await generateJsonWithRetry(prompt);

    if (hasExpectedDays(firstResponse, expectedDays)) {
      return firstResponse;
    }

    console.warn(
      `AI returned ${firstResponse?.days?.length || 0} days, expected ${expectedDays}. Retrying full itinerary generation.`,
    );

    const repairPrompt = `
The previous JSON itinerary did not contain enough day objects.

Required day count: ${expectedDays}
Returned day count: ${firstResponse?.days?.length || 0}

Regenerate the complete itinerary as valid JSON only.
The "days" array MUST contain exactly ${expectedDays} objects, sequentially named Day 1 through Day ${expectedDays}.
Do not summarize multiple days into one object.
Do not omit later days.
Keep the same schema, budget rules, arrival/departure travel options, dayTransport, stayOptions, and day-specific foodOptions requested below.

Original instructions:
${prompt}
`;

    const secondResponse = await generateJsonWithRetry(repairPrompt);

    if (!hasExpectedDays(secondResponse, expectedDays)) {
      console.warn(
        `AI retry returned ${secondResponse?.days?.length || 0} days, expected ${expectedDays}.`,
      );
    }

    return secondResponse;
  } catch (error) {
    console.error("AI ERROR:", error);

    return {
      summary: "Failed to generate itinerary",
      days: [],
      budget: {},
      tips: ["Please try again"],
    };
  }
}
