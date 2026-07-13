export type PaymentPlanId = "silver" | "gold";

export type PaymentPlan = {
  id: PaymentPlanId;
  name: string;
  amount: number;
  currency: "INR";
  features: string[];
};

export const PAYMENT_PLANS: Record<PaymentPlanId, PaymentPlan> = {
  silver: {
    id: "silver",
    name: "Silver",
    amount: 9,
    currency: "INR",
    features: ["Generate itinerary", "View itinerary"],
  },
  gold: {
    id: "gold",
    name: "Gold",
    amount: 49,
    currency: "INR",
    features: ["Generate itinerary", "View itinerary", "Download itinerary", "Share itinerary", "Export itinerary"],
  },
};

export function getPaymentPlan(planId?: string | null) {
  return (planId && PAYMENT_PLANS[planId as PaymentPlanId]) || PAYMENT_PLANS.silver;
}
