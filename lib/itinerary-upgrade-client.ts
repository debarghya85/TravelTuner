"use client";

import { openRazorpayCheckout } from "./razorpay-client";

export async function startItineraryUpgradeCheckout(params: {
  itineraryId: string;
  onVerified?: (data: any) => void;
  onCancelled?: () => void;
}) {
  const response = await fetch("/api/itinerary-upgrades/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itineraryId: params.itineraryId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || "Failed to create upgrade order");
  }

  const data = await response.json();
  const opened = await openRazorpayCheckout({
    key: String(data.keyId || data.key_id || data.checkout?.key_id || ""),
    amount: Number(data.amount || data.checkout?.amount || 0),
    currency: String(data.currency || data.checkout?.currency || "INR"),
    order_id: String(data.gatewayOrderId || data.checkout?.order_id || ""),
    name: "Travel Tuner",
    description: "Upgrade itinerary to Gold",
    prefill: {},
    theme: { color: "#ff6a00" },
    handler: async (responseData) => {
      const verifyResponse = await fetch("/api/itinerary-upgrades/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itineraryId: params.itineraryId,
          razorpay_payment_id: responseData.razorpay_payment_id,
          razorpay_order_id: responseData.razorpay_order_id,
          razorpay_signature: responseData.razorpay_signature,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData?.message || "Payment verification failed");
      }

      const verifyData = await verifyResponse.json();
      params.onVerified?.(verifyData);
    },
    modal: {
      ondismiss: () => params.onCancelled?.(),
    },
  });

  if (!opened) {
    throw new Error("Failed to open Razorpay checkout");
  }
}

