import { NextResponse } from "next/server";
import { createItineraryJob, findItineraryJobByPaymentOrderId } from "../../../../lib/itinerary-jobs";
import {
  getItineraryRequestByPaymentOrderId,
  getPaymentOrderByGatewayOrderId,
  getRazorpayWebhookUrl,
  isWebhookEventProcessed,
  markPaymentCaptured,
  markPaymentFailedByGatewayOrderId,
  markPaymentRefunded,
  markWebhookEventProcessed,
  recordWebhookEvent,
  verifyRazorpayWebhookSignature,
} from "../../../../lib/payments";

export const runtime = "nodejs";

type RazorpayWebhookEnvelope = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    order?: { entity?: Record<string, unknown> };
    refund?: { entity?: Record<string, unknown> };
  };
};

function logWebhook(message: string, meta: Record<string, unknown> = {}) {
  const isProduction = process.env.NODE_ENV === "production";
  const payload = isProduction ? meta : { ...meta, webhookUrl: getRazorpayWebhookUrl() };
  console.log(`[razorpay-webhook] ${message}`, payload);
}

function extractEntity(payload: RazorpayWebhookEnvelope, kind: "payment" | "order" | "refund") {
  return payload?.payload?.[kind]?.entity || {};
}

async function handleCaptured(payload: RazorpayWebhookEnvelope, signature: string | null) {
  const payment = extractEntity(payload, "payment");
  const orderEntity = extractEntity(payload, "order");
  const gatewayOrderId = String(payment.order_id || orderEntity.id || "");
  const gatewayPaymentId = String(payment.id || "");
  const eventId = String(payment.id || orderEntity.id || `${payload.event}:${gatewayOrderId}`);

  if (!gatewayOrderId || !gatewayPaymentId) {
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  if (await isWebhookEventProcessed("razorpay", eventId)) {
    return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
  }

  const order = await getPaymentOrderByGatewayOrderId(gatewayOrderId);
  if (!order) {
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  await recordWebhookEvent({
    provider: "razorpay",
    eventId,
    eventType: payload.event || "payment.captured",
    gatewayOrderId,
    gatewayPaymentId,
    payload: payload as Record<string, unknown>,
  });

  const updated = await markPaymentCaptured({
    gatewayOrderId,
    gatewayPaymentId,
    signature,
    paymentMethod: String(payment.method || payment.wallet || "upi"),
  });

  if (!updated) {
    return NextResponse.json({ success: false, message: "Unable to update payment" }, { status: 409 });
  }

  const request = await getItineraryRequestByPaymentOrderId(updated.id);
  const existingJob = await findItineraryJobByPaymentOrderId(updated.id);
  if (!existingJob) {
    await createItineraryJob({
      userId: order.userId,
      input: {
        ...(request?.input || {}),
        paymentOrderId: updated.id,
        paymentVerified: true,
        planId: order.planId,
        webhookEventId: eventId,
      },
    });
  }

  await markWebhookEventProcessed("razorpay", eventId);
  return NextResponse.json({ success: true, verified: true }, { status: 200 });
}

async function handleFailed(payload: RazorpayWebhookEnvelope) {
  const payment = extractEntity(payload, "payment");
  const orderEntity = extractEntity(payload, "order");
  const gatewayOrderId = String(payment.order_id || orderEntity.id || "");
  const gatewayPaymentId = String(payment.id || "");
  const eventId = String(payment.id || orderEntity.id || `${payload.event}:${gatewayOrderId}`);

  if (!gatewayOrderId) {
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  if (await isWebhookEventProcessed("razorpay", eventId)) {
    return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
  }

  await recordWebhookEvent({
    provider: "razorpay",
    eventId,
    eventType: payload.event || "payment.failed",
    gatewayOrderId,
    gatewayPaymentId,
    payload: payload as Record<string, unknown>,
  });

  await markPaymentFailedByGatewayOrderId({
    gatewayOrderId,
    gatewayPaymentId,
    failureReason: String(payment.error_description || payment.error_reason || "Payment failed"),
    paymentMethod: String(payment.method || payment.wallet || "upi"),
  });

  await markWebhookEventProcessed("razorpay", eventId);
  return NextResponse.json({ success: true, failed: true }, { status: 200 });
}

async function handleRefund(payload: RazorpayWebhookEnvelope) {
  const refund = extractEntity(payload, "refund");
  const payment = extractEntity(payload, "payment");
  const orderEntity = extractEntity(payload, "order");
  const gatewayOrderId = String(payment.order_id || orderEntity.id || "");
  const gatewayPaymentId = String(payment.id || refund.payment_id || "");
  const refundId = String(refund.id || "");
  const eventId = String(refund.id || payment.id || orderEntity.id || `${payload.event}:${gatewayOrderId}`);

  if (!gatewayOrderId) {
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  if (await isWebhookEventProcessed("razorpay", eventId)) {
    return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
  }

  await recordWebhookEvent({
    provider: "razorpay",
    eventId,
    eventType: payload.event || "refund.processed",
    gatewayOrderId,
    gatewayPaymentId,
    payload: payload as Record<string, unknown>,
  });

  await markPaymentRefunded({
    gatewayOrderId,
    gatewayPaymentId,
    refundId,
    refundStatus: String(refund.status || "processed"),
  });

  await markWebhookEventProcessed("razorpay", eventId);
  return NextResponse.json({ success: true, refunded: true }, { status: 200 });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    console.error("[razorpay-webhook] invalid signature");
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
  }

  let payload: RazorpayWebhookEnvelope;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error("[razorpay-webhook] malformed JSON", error);
    return NextResponse.json({ success: false, message: "Malformed payload" }, { status: 400 });
  }

  const event = payload?.event || "";
  const payment = extractEntity(payload, "payment");
  const gatewayPaymentId = String(payment.id || "");
  const gatewayOrderId = String(payment.order_id || extractEntity(payload, "order").id || "");

  logWebhook("received", {
    event,
    paymentId: gatewayPaymentId,
    orderId: gatewayOrderId,
    signatureVerified: true,
  });

  if (event === "payment.captured" || event === "order.paid") {
    return handleCaptured(payload, signature);
  }

  if (event === "payment.failed") {
    return handleFailed(payload);
  }

  if (event === "refund.processed") {
    return handleRefund(payload);
  }

  console.log("[razorpay-webhook] ignored event", { event });
  return NextResponse.json({ success: true, ignored: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}
