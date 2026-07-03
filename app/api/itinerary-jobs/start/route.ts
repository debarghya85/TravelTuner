import { NextResponse } from "next/server";
import { createItineraryJob } from "../../../../lib/itinerary-jobs";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";

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

  const processUrl = new URL(`/api/itinerary-jobs/${job.id}/process`, req.url).toString();
  queueMicrotask(() => {
    void fetch(processUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secret: job.secret }),
    }).catch((error) => {
      console.error("[jobs] failed to kick off itinerary processing", error);
    });
  });

  return NextResponse.json({
    success: true,
    started: true,
    jobId: job.id,
  });
}
