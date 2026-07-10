"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openRazorpayCheckout } from "../lib/razorpay-client";

export default function Form() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "Kolkata",
          destination: "Munsiary",
          days: 4,
          budget: 40000,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const data = await res.json();
      const opened = await openRazorpayCheckout({
        key: String(data.key_id || data.checkout?.key_id || ""),
        amount: Number(data.amount || data.checkout?.amount || 0),
        currency: String(data.currency || data.checkout?.currency || "INR"),
        order_id: String(data.order_id || data.checkout?.order_id || ""),
        name: "Travel Tuner",
        description: "Travel itinerary payment",
        theme: { color: "#ff6a00" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (verifyData?.jobId) {
            window.sessionStorage.setItem("travel-tuner:last-job-id", String(verifyData.jobId));
          }
          router.push("/progress");
        },
      });

      if (!opened) {
        throw new Error("Failed to open Razorpay checkout");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Itinerary"}
      </button>
    </form>
  );
}
