import { buildPrompt } from "../../../utils/buildPrompt";
import { callAI } from "../../../lib/ai";

export async function POST(req: Request) {
  const body = await req.json();

  const prompt = buildPrompt(body);

  const aiResponse = await callAI(prompt);

  return Response.json({
    itinerary: aiResponse,
  });
}