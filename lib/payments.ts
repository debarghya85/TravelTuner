import crypto from "crypto";
import { ObjectId } from "mongodb";
import { connectDB } from "./mongodb";
import { PaymentPlanId, getPaymentPlan } from "./payment-plans";

export type PaymentOrderStatus =
  | "payment_pending"
  | "payment_failed"
  | "verified"
  | "paid"
  | "refunded"
  | "refund_initiated"
  | "refund_success"
  | "refund_failed";

export type WebhookEventType = "payment.captured" | "payment.failed" | "order.paid" | "refund.processed";

type WebhookEventDoc = {
  _id: ObjectId;
  provider: "razorpay";
  eventId: string;
  eventType: WebhookEventType | string;
  gatewayPaymentId?: string | null;
  gatewayOrderId?: string | null;
  payload: Record<string, unknown>;
  processedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type PaymentOrderDoc = {
  _id: ObjectId;
  userId: ObjectId;
  itineraryRequestId: ObjectId;
  planId: PaymentPlanId;
  amount: number;
  currency: "INR";
  status: PaymentOrderStatus;
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  verificationSignature?: string | null;
  paymentMethod?: string | null;
  failureReason?: string | null;
  refundStatus?: string | null;
  refundId?: string | null;
  refundProcessedAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  paidAt?: Date | null;
  verifiedAt?: Date | null;
};

type ItineraryRequestDoc = {
  _id: ObjectId;
  userId: ObjectId;
  planId: PaymentPlanId;
  paymentOrderId: ObjectId;
  paymentStatus: "pending" | "paid" | "failed";
  aiJobId?: ObjectId | null;
  input?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

export function normalizePaymentOrder(doc: PaymentOrderDoc) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    itineraryRequestId: doc.itineraryRequestId.toString(),
    planId: doc.planId,
    amount: doc.amount,
    currency: doc.currency,
    status: doc.status,
    gatewayOrderId: doc.gatewayOrderId,
    gatewayPaymentId: doc.gatewayPaymentId || null,
    verificationSignature: doc.verificationSignature || null,
    paymentMethod: doc.paymentMethod || null,
    failureReason: doc.failureReason || null,
    refundStatus: doc.refundStatus || null,
    refundId: doc.refundId || null,
    refundProcessedAt: doc.refundProcessedAt ? doc.refundProcessedAt.toISOString() : null,
    metadata: doc.metadata || {},
    createdAt: (doc.createdAt || new Date(0)).toISOString(),
    updatedAt: (doc.updatedAt || doc.createdAt || new Date(0)).toISOString(),
    paidAt: doc.paidAt ? doc.paidAt.toISOString() : null,
    verifiedAt: doc.verifiedAt ? doc.verifiedAt.toISOString() : null,
  };
}

export function normalizeItineraryRequest(doc: ItineraryRequestDoc) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    planId: doc.planId,
    paymentOrderId: doc.paymentOrderId.toString(),
    paymentStatus: doc.paymentStatus,
    aiJobId: doc.aiJobId?.toString() || null,
    input: doc.input || {},
    createdAt: (doc.createdAt || new Date(0)).toISOString(),
    updatedAt: (doc.updatedAt || doc.createdAt || new Date(0)).toISOString(),
  };
}

export async function createItineraryRequestWithPayment(data: {
  userId: string;
  input: Record<string, unknown>;
  planId?: PaymentPlanId;
}) {
  const db = await connectDB();
  const plan = getPaymentPlan(data.planId);
  const now = new Date();
  const gatewayOrder = await createRazorpayGatewayOrder({
    amount: plan.amount * 100,
    currency: plan.currency,
    receipt: `tt_${crypto.randomUUID().replace(/-/g, "")}`,
    notes: {
      planId: plan.id,
      userId: data.userId,
    },
  });
  const requestInsert = await db.collection("itinerary_requests").insertOne({
    userId: new ObjectId(data.userId),
    planId: plan.id,
    paymentOrderId: null,
    paymentStatus: "pending",
    aiJobId: null,
    input: data.input,
    createdAt: now,
    updatedAt: now,
  });

  const orderInsert = await db.collection("payment_orders").insertOne({
    userId: new ObjectId(data.userId),
    itineraryRequestId: requestInsert.insertedId,
    planId: plan.id,
    amount: gatewayOrder.amount,
    currency: plan.currency,
    status: "payment_pending",
    gatewayOrderId: gatewayOrder.id,
    gatewayPaymentId: null,
    verificationSignature: null,
    metadata: { features: plan.features, razorpay: gatewayOrder.raw },
    createdAt: now,
    updatedAt: now,
    paidAt: null,
    verifiedAt: null,
  });

  await db.collection("itinerary_requests").updateOne(
    { _id: requestInsert.insertedId },
    { $set: { paymentOrderId: orderInsert.insertedId, updatedAt: now } },
  );

  return {
    request: normalizeItineraryRequest({
      _id: requestInsert.insertedId,
      userId: new ObjectId(data.userId),
      planId: plan.id,
      paymentOrderId: orderInsert.insertedId,
      paymentStatus: "pending",
      aiJobId: null,
      input: data.input,
      createdAt: now,
      updatedAt: now,
    }),
    order: normalizePaymentOrder({
      _id: orderInsert.insertedId,
      userId: new ObjectId(data.userId),
      itineraryRequestId: requestInsert.insertedId,
      planId: plan.id,
      amount: gatewayOrder.amount,
      currency: plan.currency,
      status: "payment_pending",
      gatewayOrderId: gatewayOrder.id,
      gatewayPaymentId: null,
      verificationSignature: null,
      metadata: { features: plan.features, razorpay: gatewayOrder.raw },
      createdAt: now,
      updatedAt: now,
      paidAt: null,
      verifiedAt: null,
    }),
  };
}

export async function getPaymentOrderById(orderId: string) {
  const db = await connectDB();
  const doc = await db.collection("payment_orders").findOne({ _id: new ObjectId(orderId) });
  return doc ? normalizePaymentOrder(doc as any) : null;
}

export async function getPaymentOrderByGatewayOrderId(gatewayOrderId: string) {
  const db = await connectDB();
  const doc = await db.collection("payment_orders").findOne({ gatewayOrderId });
  return doc ? normalizePaymentOrder(doc as any) : null;
}

export async function getItineraryRequestByPaymentOrderId(paymentOrderId: string) {
  const db = await connectDB();
  const doc = await db.collection("itinerary_requests").findOne({ paymentOrderId: new ObjectId(paymentOrderId) });
  return doc ? normalizeItineraryRequest(doc as any) : null;
}

export async function getItineraryRequestById(requestId: string) {
  const db = await connectDB();
  const doc = await db.collection("itinerary_requests").findOne({ _id: new ObjectId(requestId) });
  return doc ? normalizeItineraryRequest(doc as any) : null;
}

export async function markPaymentVerified(params: {
  orderId: string;
  gatewayPaymentId: string;
  signature?: string | null;
  paymentMethod?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const result = await db.collection("payment_orders").findOneAndUpdate(
    { _id: new ObjectId(params.orderId) },
    {
      $set: {
        status: "verified",
        gatewayPaymentId: params.gatewayPaymentId,
        verificationSignature: params.signature || null,
        paymentMethod: params.paymentMethod || null,
        paidAt: now,
        verifiedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  const order = (result as any)?.value ?? result;
  if (!order) {
    return null;
  }

  await db.collection("itinerary_requests").updateOne(
    { _id: order.itineraryRequestId },
    { $set: { paymentStatus: "paid", updatedAt: now } },
  );

  return normalizePaymentOrder(order as any);
}

export async function markPaymentFailed(orderId: string) {
  const db = await connectDB();
  await db.collection("payment_orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        status: "payment_failed",
        updatedAt: new Date(),
      },
    },
  );
}

export async function markPaymentFailedByGatewayOrderId(params: {
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  failureReason?: string | null;
  paymentMethod?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const result = await db.collection("payment_orders").findOneAndUpdate(
    { gatewayOrderId: params.gatewayOrderId },
    {
      $set: {
        status: "payment_failed",
        gatewayPaymentId: params.gatewayPaymentId || null,
        failureReason: params.failureReason || null,
        paymentMethod: params.paymentMethod || null,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  const order = (result as any)?.value ?? result;
  if (!order) {
    return null;
  }

  await db.collection("itinerary_requests").updateOne(
    { _id: order.itineraryRequestId },
    { $set: { paymentStatus: "failed", updatedAt: now } },
  );

  return normalizePaymentOrder(order as any);
}

export async function markPaymentCaptured(params: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature?: string | null;
  paymentMethod?: string | null;
  amount?: number | null;
  currency?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const result = await db.collection("payment_orders").findOneAndUpdate(
    { gatewayOrderId: params.gatewayOrderId },
    {
      $set: {
        status: "verified",
        gatewayPaymentId: params.gatewayPaymentId,
        verificationSignature: params.signature || null,
        paymentMethod: params.paymentMethod || null,
        paidAt: now,
        verifiedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  const order = (result as any)?.value ?? result;
  if (!order) {
    return null;
  }

  await db.collection("itinerary_requests").updateOne(
    { _id: order.itineraryRequestId },
    { $set: { paymentStatus: "paid", updatedAt: now } },
  );

  return normalizePaymentOrder(order as any);
}

export async function markPaymentRefunded(params: {
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  refundId?: string | null;
  refundStatus?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const result = await db.collection("payment_orders").findOneAndUpdate(
    { gatewayOrderId: params.gatewayOrderId },
    {
      $set: {
        status: "refunded",
        gatewayPaymentId: params.gatewayPaymentId || null,
        refundId: params.refundId || null,
        refundStatus: params.refundStatus || "processed",
        refundProcessedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  const order = (result as any)?.value ?? result;
  if (!order) {
    return null;
  }

  await db.collection("itinerary_requests").updateOne(
    { _id: order.itineraryRequestId },
    { $set: { paymentStatus: "failed", updatedAt: now } },
  );

  return normalizePaymentOrder(order as any);
}

export async function requestRazorpayRefund(params: {
  gatewayPaymentId: string;
  amount?: number;
  speed?: "normal" | "optimum";
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/payments/${params.gatewayPaymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: typeof params.amount === "number" ? params.amount : undefined,
      speed: params.speed || "normal",
      notes: params.notes || {},
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to create Razorpay refund: ${response.status} ${text}`.trim());
  }

  const data = await response.json();
  return {
    id: String(data.id || ""),
    paymentId: String(data.payment_id || params.gatewayPaymentId),
    status: String(data.status || "processed"),
    amount: Number(data.amount || params.amount || 0),
    raw: data,
  };
}

export async function getWebhookEventById(provider: "razorpay", eventId: string) {
  const db = await connectDB();
  const doc = await db.collection("payment_webhook_events").findOne({ provider, eventId });
  return doc ? (doc as unknown as WebhookEventDoc) : null;
}

export async function recordWebhookEvent(params: {
  provider: "razorpay";
  eventId: string;
  eventType: WebhookEventType | string;
  gatewayPaymentId?: string | null;
  gatewayOrderId?: string | null;
  payload: Record<string, unknown>;
}) {
  const db = await connectDB();
  const now = new Date();
  const result = await db.collection("payment_webhook_events").updateOne(
    { provider: params.provider, eventId: params.eventId },
    {
      $setOnInsert: {
        provider: params.provider,
        eventId: params.eventId,
        eventType: params.eventType,
        gatewayPaymentId: params.gatewayPaymentId || null,
        gatewayOrderId: params.gatewayOrderId || null,
        payload: params.payload,
        processedAt: null,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true },
  );

  return result;
}

export async function markWebhookEventProcessed(provider: "razorpay", eventId: string) {
  const db = await connectDB();
  await db.collection("payment_webhook_events").updateOne(
    { provider, eventId },
    { $set: { processedAt: new Date(), updatedAt: new Date() } },
  );
}

export async function isWebhookEventProcessed(provider: "razorpay", eventId: string) {
  const db = await connectDB();
  const doc = await db.collection("payment_webhook_events").findOne({ provider, eventId });
  return Boolean((doc as any)?.processedAt);
}

export function getRazorpayWebhookUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://travel-tuner.netlify.app/api/webhooks/razorpay";
  }

  return process.env.RAZORPAY_WEBHOOK_URL || "/api/webhooks/razorpay";
}

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return { keyId, keySecret };
}

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}

export async function createRazorpayGatewayOrder(params: {
  amount: number;
  currency: "INR";
  receipt: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      payment_capture: 1,
      notes: params.notes || {},
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to create Razorpay order: ${response.status} ${text}`.trim());
  }

  const data = await response.json();
  return {
    id: String(data.id),
    amount: Number(data.amount),
    currency: String(data.currency) as "INR",
    receipt: String(data.receipt || params.receipt),
    status: String(data.status || "created"),
    raw: data,
  };
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null | undefined) {
  if (!signature) {
    return false;
  }

  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
