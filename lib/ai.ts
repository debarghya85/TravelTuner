import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview", // ✅ use working model
});

export async function callAI(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("RAW AI:", text);

    // 🔥 Extract JSON safely
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON response");
    }

    const jsonString = text.substring(start, end + 1);

    return JSON.parse(jsonString);

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