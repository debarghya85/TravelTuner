import { NextResponse } from "next/server";
import { createItineraryUpgradeOrder } from "../../../../lib/itinerary-upgrade";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const itineraryId = String(body?.itineraryId || "");

  if (!itineraryId) {
    return NextResponse.json({ success: false, message: "Missing itineraryId" }, { status: 400 });
  }

  try {
    const checkout = await createItineraryUpgradeOrder({
      itineraryId,
      userId: user.id,
    });

    return NextResponse.json({ success: true, ...checkout });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to create upgrade order" },
      { status: 500 },
    );
  }
}
