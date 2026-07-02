import { buildPrompt } from "../../../utils/buildPrompt";
import { callAI } from "../../../lib/ai";
import { buildCoverImageUrl } from "../../../lib/cover-image";
import { saveItineraryRecord } from "../../../lib/itinerary-store";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = getAuthenticatedUserFromRequest();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const prompt = buildPrompt(body);
    const aiResponse = await callAI(prompt, Number(body.days));
    const coverImageUrl = buildCoverImageUrl(aiResponse.coverImagePrompt);

    try {
      await saveItineraryRecord({
        input: body,
        output: {
          ...aiResponse,
          coverImageUrl,
        },
        userId: user.id,
      });
    } catch (error) {
      console.error("Failed to save itinerary record:", error);
    }

    return Response.json({
      success: true,
      itinerary: aiResponse,
    });
  } catch (error: any) {
    console.error("Failed to generate itinerary:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate itinerary",
        error: error?.message || "Unknown error",
      },
      { status: 503 },
    );
  }
}
