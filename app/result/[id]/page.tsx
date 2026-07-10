"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResultFrame, EmptyItinerary } from "../ResultShell";
import { saveItinerary } from "../itinerary-data";
import ResultPage from "../page";

export default function SavedResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);

  useEffect(() => {
      const load = async () => {
        const response = await fetch(`/api/itineraries/${params.id}`);
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          setLoading(false);
          setFound(false);
          return;
        }

      const data = await response.json();
      saveItinerary({
        success: true,
        planId: data.planId || data.itinerary?.planId || "view-only",
        itinerary: data.itinerary || {},
      });
      setFound(true);
      setLoading(false);
    };

    load();
  }, [params.id]);

  if (loading) {
    return (
      <ResultFrame title="Loading itinerary" subtitle="Rehydrating your saved result..." backHref="/itineraries">
        <div className="saved-state">Loading itinerary...</div>
      </ResultFrame>
    );
  }

  if (!found) {
    return <EmptyItinerary />;
  }

  return <ResultPage />;
}
