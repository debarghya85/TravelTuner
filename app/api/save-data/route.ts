import { NextResponse } from "next/server";
import { buildCoverImageUrl } from "../../../lib/cover-image";
import { saveItineraryRecord } from "../../../lib/itinerary-store";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const output = body.output || body.itinerary || body;
    const coverImageUrl = buildCoverImageUrl(output.coverImagePrompt);
    await saveItineraryRecord({
      input: body.input || {},
      output: {
        ...output,
        coverImageUrl,
      },
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to save itinerary data:", error);
  }

  return NextResponse.json({ success: true });
}
