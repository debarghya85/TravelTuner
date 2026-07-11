import { NextResponse } from "next/server";
import { createItineraryJob, findItineraryJobByPaymentOrderId } from "../../../../lib/itinerary-jobs";
import { getItineraryRequestByPaymentOrderId, getPaymentOrderByGatewayOrderId, markPaymentCaptured } from "../../../../lib/payments";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const razorpayOrderId = String(body?.razorpay_order_id || body?.order_id || body?.orderId || "");
  const paymentId = String(body?.razorpay_payment_id || body?.paymentId || "");
  const signature = String(body?.razorpay_signature || body?.signature || "");

  if (!razorpayOrderId || !paymentId || !signature) {
    return NextResponse.json({ success: false, message: "Missing payment verification fields" }, { status: 400 });
  }

  const order = await getPaymentOrderByGatewayOrderId(razorpayOrderId);
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const verified = await markPaymentCaptured({
    gatewayOrderId: razorpayOrderId,
    gatewayPaymentId: paymentId,
    signature,
    paymentMethod: String(body?.method || body?.payment_method || "upi"),
  });

  if (!verified) {
    return NextResponse.json({ success: false, message: "Unable to verify payment" }, { status: 409 });
  }

  const request = await getItineraryRequestByPaymentOrderId(verified.id);
  const existingJob = await findItineraryJobByPaymentOrderId(verified.id);

  let jobId = existingJob?.id || null;
  if (!existingJob) {
    const job = await createItineraryJob({
      userId: user.id,
      input: {
        ...(request?.input || {}),
        paymentOrderId: verified.id,
        paymentVerified: true,
        planId: order.planId,
      },
    });
    jobId = job.id;
  }

  return NextResponse.json({
    success: true,
    paymentStatus: "SUCCESS",
    order: verified,
    jobId,
  });
}
