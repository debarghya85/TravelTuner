import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_TIMEOUT_MS = Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 110000);

const MODEL_CANDIDATES = (
  process.env.GEMINI_MODEL_FALLBACKS?.split(",") ?? [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ]
)
  .map((model) => model.trim())
  .filter(Boolean);
const PRIMARY_MODEL = MODEL_CANDIDATES[0] || "gemini-2.5-flash";
const ENABLE_MODEL_FALLBACKS = String(process.env.GEMINI_ENABLE_MODEL_FALLBACKS ?? "true").toLowerCase() === "true";

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
  const modelNames = ENABLE_MODEL_FALLBACKS ? MODEL_CANDIDATES : [PRIMARY_MODEL];

  for (const modelName of modelNames) {
    try {
      const model = getModel(modelName);
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini request timed out after ${MODEL_TIMEOUT_MS}ms`)), MODEL_TIMEOUT_MS),
        ),
      ]);
      const text = result.response.text();

      console.log(`RAW AI (${modelName}):`, text);

      return parseJsonResponse(text);
    } catch (error: any) {
      lastError = error;

      if (!ENABLE_MODEL_FALLBACKS) {
        throw error;
      }

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
    const firstResponse = await generateJsonWithRetry(prompt, 1);

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

    const secondResponse = await generateJsonWithRetry(repairPrompt, 1);

    if (!hasExpectedDays(secondResponse, expectedDays)) {
      console.warn(
        `AI retry returned ${secondResponse?.days?.length || 0} days, expected ${expectedDays}.`,
      );
    }

    return secondResponse;
  } catch (error) {
    console.error("AI ERROR:", error);

    throw error;
  }
}
