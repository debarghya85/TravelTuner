import { buildPrompt } from "../../../utils/buildPrompt";
import { callAI } from "../../../lib/ai";
import { saveItineraryRecord } from "../../../lib/itinerary-store";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const prompt = buildPrompt(body);

  const aiResponse = await callAI(prompt, Number(body.days));

  try {
    await saveItineraryRecord({
      input: body,
      output: aiResponse,
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to save itinerary record:", error);
  }

  return Response.json({
    success: true,
    itinerary: aiResponse,
  });
}
