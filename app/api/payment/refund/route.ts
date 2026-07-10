import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getPaymentOrderByGatewayOrderId, markPaymentRefunded, requestRazorpayRefund } from "../../../../lib/payments";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const gatewayOrderId = String(body?.razorpay_order_id || body?.order_id || "");
  if (!gatewayOrderId) {
    return NextResponse.json({ success: false, message: "Missing order id" }, { status: 400 });
  }

  const order = await getPaymentOrderByGatewayOrderId(gatewayOrderId);
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const gatewayPaymentId = String(body?.razorpay_payment_id || body?.payment_id || order.gatewayPaymentId || "");
  const refund = gatewayPaymentId
    ? await requestRazorpayRefund({
        gatewayPaymentId,
        amount: order.amount,
        speed: String(body?.speed || "normal") as "normal" | "optimum",
        notes: {
          reason: String(body?.reason || "manual refund request"),
          orderId: order.id,
        },
      })
    : null;

  const refunded = await markPaymentRefunded({
    gatewayOrderId,
    gatewayPaymentId,
    refundId: String(body?.refund_id || refund?.id || `rfnd_${gatewayOrderId}`),
    refundStatus: String(body?.refund_status || refund?.status || "processed"),
  });

  return NextResponse.json({
    success: Boolean(refunded),
    paymentStatus: refunded?.status || order.status,
    order: refunded || order,
  });
}
