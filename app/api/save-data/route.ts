import { NextResponse } from "next/server";
import { saveItineraryRecord } from "../../../lib/itinerary-store";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    await saveItineraryRecord({
      input: body.input || {},
      output: body.output || body.itinerary || body,
    });
  } catch (error) {
    console.error("Failed to save itinerary data:", error);
  }

  return NextResponse.json({ success: true });
}
