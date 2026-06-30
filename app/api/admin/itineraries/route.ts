import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../lib/admin-auth";
import { listItineraryRecords } from "../../../../lib/itinerary-store";

export async function GET() {
  if (!isAdminSessionValid()) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const records = await listItineraryRecords();
  return NextResponse.json({ success: true, records });
}
