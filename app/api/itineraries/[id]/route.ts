import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getItineraryRecordByIdForUser } from "../../../../lib/itinerary-store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const itinerary = await getItineraryRecordByIdForUser(params.id, user.id);
  if (!itinerary) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    planId: itinerary.input?.planId || null,
    itinerary: {
      ...((itinerary.output.itinerary || itinerary.output) as Record<string, unknown>),
      planId: itinerary.input?.planId || null,
    },
  });
}
