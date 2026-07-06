import { NextResponse } from "next/server";
import { processItineraryJob } from "../../../../../lib/itinerary-job-worker";
import { getItineraryJobById } from "../../../../../lib/itinerary-jobs";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const job = await getItineraryJobById(params.id);

  if (!job) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  void processItineraryJob(job.id).catch((error) => {
    console.error("[jobs] failed to process itinerary job", error);
  });

  return NextResponse.json({ success: true, started: true }, { status: 202 });
}
