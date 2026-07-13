import crypto from "crypto";
import { ObjectId } from "mongodb";
import { connectDB } from "./mongodb";
import { createRazorpayGatewayOrder, verifyRazorpayPaymentSignature } from "./payments";
import { getPlanDisplayName, normalizePlanTier } from "./plan-names";

type PlanDoc = {
  _id: ObjectId;
  plan_id?: string;
  plan_name?: string;
  name?: string;
  title?: string;
  tier?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

async function getPlanByTier(tier: "silver" | "gold") {
  const db = await connectDB();
  const candidates = [
    { plan_id: tier, plan_name: getPlanDisplayName(tier), name: getPlanDisplayName(tier), tier },
  ];

  for (const query of candidates) {
    const doc = (await db.collection("plans").findOne(query as Record<string, unknown>)) as PlanDoc | null;
    if (doc) {
      return {
        id: doc._id.toString(),
        planId: String(doc.plan_id || tier),
        planName: String(doc.plan_name || doc.name || doc.title || getPlanDisplayName(tier)),
        amount: Number(doc.amount || (tier === "gold" ? 3500 : 0)),
        currency: String(doc.currency || "INR"),
        raw: doc,
      };
    }
  }

  return {
    id: tier,
    planId: tier,
    planName: getPlanDisplayName(tier),
    amount: tier === "gold" ? 3500 : 0,
    currency: "INR",
    raw: null,
  };
}

export async function createItineraryUpgradeOrder(params: {
  itineraryId: string;
  userId?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const itineraryId = new ObjectId(params.itineraryId);
  const itinerary = await db.collection("itinerary_generations").findOne({ _id: itineraryId });

  if (!itinerary) {
    throw new Error("Itinerary not found");
  }

  const currentPlanTier = normalizePlanTier(String((itinerary as any)?.input?.planId || (itinerary as any)?.output?.itinerary?.planId || "silver"));
  const goldPlan = await getPlanByTier("gold");
  const silverPlan = await getPlanByTier(currentPlanTier);
  const amount = 3500;

  const gatewayOrder = await createRazorpayGatewayOrder({
    amount,
    currency: "INR",
    receipt: `upgrade_${crypto.randomUUID().replace(/-/g, "")}`,
    notes: {
      itineraryId: params.itineraryId,
      userId: params.userId || "",
      fromPlan: silverPlan.planName,
      toPlan: goldPlan.planName,
      purpose: "itinerary_upgrade",
    },
  });

  const upgradeOrder = await db.collection("itinerary_upgrade_orders").insertOne({
    itineraryId,
    userId: params.userId ? new ObjectId(params.userId) : null,
    previousPlanId: silverPlan.planId,
    previousPlanName: silverPlan.planName,
    newPlanId: goldPlan.planId,
    newPlanName: goldPlan.planName,
    amount,
    currency: "INR",
    status: "created",
    gatewayOrderId: gatewayOrder.id,
    gatewayPaymentId: null,
    gatewaySignature: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    upgradeOrderId: upgradeOrder.insertedId.toString(),
    itineraryId: params.itineraryId,
    amount,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    gatewayOrderId: gatewayOrder.id,
    checkout: {
      order_id: gatewayOrder.id,
      amount,
      currency: "INR",
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
      upgradeOrderId: upgradeOrder.insertedId.toString(),
    },
  };
}

export async function verifyItineraryUpgradePayment(params: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
  method?: string | null;
  itineraryId: string;
  userId?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const orderDoc = await db.collection("itinerary_upgrade_orders").findOne({ gatewayOrderId: params.gatewayOrderId });
  if (!orderDoc) {
    throw new Error("Upgrade order not found");
  }

  const verifiedSignature = verifyRazorpayPaymentSignature({
    orderId: params.gatewayOrderId,
    paymentId: params.gatewayPaymentId,
    signature: params.signature,
  });

  if (!verifiedSignature) {
    throw new Error("Unable to verify payment");
  }

  const goldPlan = await getPlanByTier("gold");
  const silverPlan = await getPlanByTier(normalizePlanTier(String((orderDoc as any).previousPlanId || "silver")));
  const itineraryId = new ObjectId(params.itineraryId);
  const itinerary = await db.collection("itinerary_generations").findOne({ _id: itineraryId });

  if (!itinerary) {
    throw new Error("Itinerary not found");
  }

  const itineraryRequestId = (itinerary as any)?.input?.paymentOrderId
    ? await db.collection("itinerary_requests").findOne({
        paymentOrderId: new ObjectId(String((itinerary as any)?.input?.paymentOrderId)),
      })
    : null;

  const updatePayload = {
    "input.planId": "gold",
    "output.itinerary.planId": "gold",
    "output.planId": "gold",
    updatedAt: now,
  } as const;

  await db.collection("itinerary_generations").updateOne(
    { _id: itineraryId },
    {
      $set: updatePayload,
    },
  );

  if (itineraryRequestId) {
    await db.collection("itinerary_requests").updateOne(
      { _id: itineraryRequestId._id },
      {
        $set: {
          planId: "gold",
          updatedAt: now,
        },
      },
    );
  }

  const jobId = (itinerary as any)?.input?.paymentOrderId
    ? await db.collection("itinerary_jobs").findOne({
        "input.paymentOrderId": String((itinerary as any)?.input?.paymentOrderId),
      })
    : null;

  if (jobId) {
    await db.collection("itinerary_jobs").updateOne(
      { _id: jobId._id },
      {
        $set: {
          "input.planId": "gold",
          "output.planId": "gold",
          "output.itinerary.planId": "gold",
          updatedAt: now,
        },
      },
    );
  }

  await db.collection("itinerary_upgrade_orders").updateOne(
    { _id: orderDoc._id },
    {
      $set: {
        status: "verified",
        gatewayPaymentId: params.gatewayPaymentId,
        gatewaySignature: params.signature,
        updatedAt: now,
      },
    },
  );

  await db.collection("itinerary_upgrade_history").insertOne({
    itineraryId,
    userId: params.userId ? new ObjectId(params.userId) : null,
    previousPlanId: silverPlan.planId,
    previousPlanName: silverPlan.planName,
    newPlanId: goldPlan.planId,
    newPlanName: goldPlan.planName,
    razorpayOrderId: params.gatewayOrderId,
    razorpayPaymentId: params.gatewayPaymentId,
    razorpaySignature: params.signature,
    paymentAmount: Number(orderDoc.amount || 3500),
    paymentCurrency: String(orderDoc.currency || "INR"),
    paymentStatus: "captured",
    upgradedAt: now,
    createdAt: now,
  });

  return {
    order: {
      gatewayOrderId: params.gatewayOrderId,
      gatewayPaymentId: params.gatewayPaymentId,
      amount: Number(orderDoc.amount || 3500),
      currency: String(orderDoc.currency || "INR"),
    },
    previousPlanId: silverPlan.planId,
    previousPlanName: silverPlan.planName,
    newPlanId: goldPlan.planId,
    newPlanName: goldPlan.planName,
  };
}
