import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";
import { listItineraryRecordsByUser } from "../../../lib/itinerary-store";

export async function GET() {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const itineraries = await listItineraryRecordsByUser(user.id);
  return NextResponse.json({ success: true, itineraries });
}
