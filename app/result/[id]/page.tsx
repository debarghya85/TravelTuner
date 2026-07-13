"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResultFrame, EmptyItinerary } from "../ResultShell";
import { saveResolvedItinerary } from "../itinerary-data";
import ResultPage from "../page";
import { normalizePlanTier } from "../../../lib/plan-names";

export default function SavedResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);
  const [planId, setPlanId] = useState<"silver" | "gold" | null>(null);
  const [itinerary, setItinerary] = useState<any | null>(null);

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
      const resolvedPlanId = normalizePlanTier(
        data.planId || data.itinerary?.planId || "silver",
      );
      setPlanId(resolvedPlanId);
      setItinerary(data.itinerary || null);
      if (data.itinerary) {
        saveResolvedItinerary(resolvedPlanId, data.itinerary, params.id);
      }
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

  return (
    <ResultPage
      planId={planId}
      itineraryId={params.id}
      initialItinerary={itinerary}
    />
  );
}
