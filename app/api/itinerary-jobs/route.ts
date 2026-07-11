import { NextResponse } from "next/server";
import { createItineraryRequestWithPayment } from "../../../lib/payments";
import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getAuthenticatedUserFromRequest();

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { request, order } = await createItineraryRequestWithPayment({
    userId: user.id,
    input: body,
    planId: body?.planId,
  });

  return NextResponse.json({
    success: true,
    requestId: request.id,
    paymentOrderId: order.id,
    order_id: order.gatewayOrderId,
    amount: order.amount,
    currency: order.currency,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    checkout: {
      order_id: order.gatewayOrderId,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
      paymentOrderId: order.id,
    },
  });
}
