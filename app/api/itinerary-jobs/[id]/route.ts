import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getItineraryJobByIdForUser } from "../../../../lib/itinerary-jobs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromRequest();

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const job = await getItineraryJobByIdForUser(params.id, user.id);
  if (!job) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      stage: job.stage,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      output: job.output,
    },
  });
}
