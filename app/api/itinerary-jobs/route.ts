import { NextResponse } from "next/server";
import { createItineraryJob } from "../../../lib/itinerary-jobs";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getAuthenticatedUserFromRequest();

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const job = await createItineraryJob({
    userId: user.id,
    input: body,
  });

  return NextResponse.json({
    success: true,
    jobId: job.id,
  });
}
