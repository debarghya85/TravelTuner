import { NextResponse } from "next/server";
import { saveItineraryRecord } from "../../../lib/itinerary-store";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await saveItineraryRecord({
      input: body.input || {},
      output: body.output || body.itinerary || body,
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to save itinerary data:", error);
  }

  return NextResponse.json({ success: true });
}
