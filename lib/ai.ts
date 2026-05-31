import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  generationConfig: {
    maxOutputTokens: 32768,
    responseMimeType: "application/json",
  },
});

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
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  console.log("RAW AI:", text);

  return parseJsonResponse(text);
}

export async function callAI(prompt: string, expectedDays?: number) {
  try {
    const firstResponse = await generateJson(prompt);

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

    const secondResponse = await generateJson(repairPrompt);

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
