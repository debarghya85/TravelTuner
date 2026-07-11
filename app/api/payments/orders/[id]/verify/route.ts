import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../../../lib/user-auth";
import { createItineraryJob } from "../../../../../../lib/itinerary-jobs";
import {
  getItineraryRequestByPaymentOrderId,
  getPaymentOrderById,
  markPaymentVerified,
} from "../../../../../../lib/payments";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const order = await getPaymentOrderById(params.id);
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const verified = await markPaymentVerified({
    orderId: order.id,
    gatewayPaymentId: String(body.paymentId || `pay_${order.gatewayOrderId}`),
    signature: body.signature || null,
  });

  if (!verified) {
    return NextResponse.json({ success: false, message: "Unable to verify payment" }, { status: 409 });
  }

  const request = await getItineraryRequestByPaymentOrderId(verified.id);
  const job = await createItineraryJob({
    userId: user.id,
    input: {
      ...(request?.input || {}),
      paymentOrderId: verified.id,
      paymentVerified: true,
      planId: order.planId,
    },
  });

  return NextResponse.json({
    success: true,
    order: verified,
    jobId: job.id,
  });
}
