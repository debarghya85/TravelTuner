"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveItinerary } from "../app/result/itinerary-data";

export default function Form() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ IMPORTANT
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

      saveItinerary(data);
      router.push("/result");
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
