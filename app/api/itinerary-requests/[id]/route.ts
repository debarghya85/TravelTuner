import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getItineraryRequestById, getPaymentOrderById } from "../../../../lib/payments";
import { findItineraryJobByPaymentOrderId } from "../../../../lib/itinerary-jobs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const request = await getItineraryRequestById(params.id);
  if (!request) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const paymentOrder = await getPaymentOrderById(request.paymentOrderId);
  if (!paymentOrder || paymentOrder.userId !== user.id) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const job = await findItineraryJobByPaymentOrderId(paymentOrder.id);

  return NextResponse.json({
    success: true,
    request,
    paymentOrder,
    job,
  });
}
