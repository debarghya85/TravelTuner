import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getItineraryRecordByIdVisibleToUser } from "../../../../lib/itinerary-store";
import { normalizePlanTier } from "../../../../lib/plan-names";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromRequest();

  const itinerary = await getItineraryRecordByIdVisibleToUser(params.id, user?.id);
  if (!itinerary) {
    return NextResponse.json({ success: false, message: user ? "Not found" : "Unauthorized" }, { status: user ? 404 : 401 });
  }

  return NextResponse.json({
    success: true,
    planId: normalizePlanTier(String(itinerary.output?.planId || itinerary.input?.planId || "silver")),
    itinerary: {
      ...(itinerary.output as Record<string, unknown>),
      planId: normalizePlanTier(String(itinerary.output?.planId || itinerary.input?.planId || "silver")),
    },
  });
}
