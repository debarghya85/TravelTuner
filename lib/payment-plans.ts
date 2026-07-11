export type PaymentPlanId = "view-only" | "premium";

export type PaymentPlan = {
  id: PaymentPlanId;
  name: string;
  amount: number;
  currency: "INR";
  features: string[];
};

export const PAYMENT_PLANS: Record<PaymentPlanId, PaymentPlan> = {
  "view-only": {
    id: "view-only",
    name: "View Only",
    amount: 9,
    currency: "INR",
    features: ["Generate itinerary", "View itinerary"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    amount: 49,
    currency: "INR",
    features: ["Generate itinerary", "View itinerary", "Download itinerary", "Share itinerary", "Export itinerary"],
  },
};

export function getPaymentPlan(planId?: string | null) {
  return (planId && PAYMENT_PLANS[planId as PaymentPlanId]) || PAYMENT_PLANS["view-only"];
}
