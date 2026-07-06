"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Form() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/itinerary-jobs", {
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
      if (data?.jobId) {
        window.sessionStorage.setItem(
          "travel-tuner:last-job-id",
          String(data.jobId),
        );
      }
      router.push("/progress");
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
