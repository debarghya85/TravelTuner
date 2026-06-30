import { buildPrompt } from "../../../utils/buildPrompt";
import { callAI } from "../../../lib/ai";
import { saveItineraryRecord } from "../../../lib/itinerary-store";

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = buildPrompt(body);

  const aiResponse = await callAI(prompt, Number(body.days));

  try {
    await saveItineraryRecord({
      input: body,
      output: aiResponse,
    });
  } catch (error) {
    console.error("Failed to save itinerary record:", error);
  }

  return Response.json({
    itinerary: aiResponse,
  });
}
