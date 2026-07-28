import { NextResponse } from "next/server";
import { listGlobalItineraryRecords } from "../../../../lib/itinerary-store";

export async function GET() {
  const itineraries = await listGlobalItineraryRecords();
  return NextResponse.json({ success: true, itineraries });
}
