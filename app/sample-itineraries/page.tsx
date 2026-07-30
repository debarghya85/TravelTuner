"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

type SampleItinerary = {
  id: string;
  createdAt: string;
  input?: {
    planId?: "silver" | "gold";
    adults?: number;
    children?: number;
    days?: number;
    destination?: string;
    budget?: number;
  };
  output?: {
    destination?: string;
    tagline?: string;
    coverImageUrl?: string;
    summary?: string;
    totalEstimatedCost?: number;
    days?: unknown[];
    planId?: "silver" | "gold";
    travelerInfo?: {
      adults?: number;
      children?: number;
    };
    itinerary?: {
      destination?: string;
      tagline?: string;
      coverImageUrl?: string;
      summary?: string;
      totalEstimatedCost?: number;
      days?: unknown[];
      travelerInfo?: {
        adults?: number;
        children?: number;
      };
      planId?: "silver" | "gold";
    };
  };
};

const includedFeatures = [
  {
    title: "Day-wise Itinerary",
    text: "Detailed plan for each day",
    icon: "calendar",
  },
  {
    title: "Stay Recommendations",
    text: "Best hotels for your budget",
    icon: "hotel",
  },
  { title: "Food Suggestions", text: "Local food to try", icon: "food" },
  {
    title: "Transport Options",
    text: "Flights, trains & local transport",
    icon: "plane",
  },
  {
    title: "Budget Breakdown",
    text: "Complete cost estimation",
    icon: "budget",
  },
  {
    title: "Attractions & Activities",
    text: "Top places & experiences",
    icon: "sparkles",
  },
  { title: "Google Maps", text: "Hotel location guides", icon: "map" },
  { title: "Travel Tips", text: "Packing & travel tips", icon: "tips" },
  { title: "Shopping Guide", text: "Best places to shop", icon: "shopping" },
];

const accentColors = ["blue", "green", "amber", "violet", "indigo"];

export default function SampleItinerariesPage() {
  const [sampleItineraries, setSampleItineraries] = useState<SampleItinerary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSamples = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/home/sample-itineraries");
        if (!res.ok) {
          throw new Error("Failed to load sample itineraries");
        }
        const data = await res.json();
        setSampleItineraries(
          Array.isArray(data.itineraries) ? data.itineraries : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sample itineraries",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSamples();
  }, []);

  const sampleCards = useMemo(() => {
    return sampleItineraries.map((item, index) => {
      const output = item.output ?? {};
      const outputAny = output as any;
      const input = item.input ?? {};
      const travelers =
        (outputAny.itinerary as any)?.travelerInfo || outputAny.travelerInfo;
      const travelerData = travelers as any;
      const adults = travelerData?.adults ?? input.adults ?? 0;
      const children = travelerData?.children ?? input.children ?? 0;
      const days = Number(input.days ?? outputAny.days?.length ?? 0);
      const nights = Math.max(days - 1, 0);
      const planId =
        outputAny.planId ?? outputAny.itinerary?.planId ?? input.planId;

      return {
        id: item.id,
        title: outputAny.destination ?? input.destination ?? "Sample itinerary",
        tagline:
          outputAny.tagline ?? outputAny.summary ?? "Global sample itinerary",
        image: outputAny.coverImageUrl ?? "/itinery_result.png",
        budget: outputAny.totalEstimatedCost ?? input.budget ?? 0,
        adults,
        children,
        planLabel: `${days} ${days === 1 ? "Day" : "Days"} / ${nights} ${nights === 1 ? "Night" : "Nights"}`,
        accent: accentColors[index % accentColors.length],
        planId,
      };
    });
  }, [sampleItineraries]);

  return (
    <main className="sample-mockup-page">
      <SiteHeader backHref="/" backLabel="Back" />

      <section className="sample-mockup-hero">
        <h1>See What You&apos;ll Get</h1>
        <p>Explore real sample itineraries pulled from the database.</p>
      </section>

      <section className="sample-mockup-grid" aria-label="Sample itineraries">
        {loading ? (
          <div className="sample-mockup-panel" style={{ gridColumn: "1 / -1" }}>
            Loading sample itineraries...
          </div>
        ) : error ? (
          <div className="sample-mockup-panel" style={{ gridColumn: "1 / -1" }}>
            {error}
          </div>
        ) : sampleCards.length ? (
          sampleCards.map((card) => (
            <article className="sample-mockup-card" key={card.id}>
              <div
                className="sample-mockup-card-media"
                style={{ backgroundImage: `url("${card.image}")` }}
              >
                <div className={`sample-mockup-duration ${card.accent}`}>
                  {card.planLabel}
                </div>
                <h3>{card.title}</h3>
              </div>
              <div className="sample-mockup-card-body">
                <p>
                  Budget: Rs {Number(card.budget || 0).toLocaleString("en-IN")}
                </p>
                <span>
                  {card.adults || 0} Adults, {card.children || 0} Children
                </span>
              </div>
              <div className="sample-mockup-card-footer">
                <Link
                  href={`/result/${card.id}`}
                  className={`sample-mockup-view ${card.accent}`}
                >
                  View Sample
                  <ArrowRight size={18} />
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="sample-mockup-panel" style={{ gridColumn: "1 / -1" }}>
            No sample itineraries found yet.
          </div>
        )}
      </section>

      <section className="sample-mockup-panel">
        <h2>Everything Included in Your Itinerary</h2>
        <div className="sample-mockup-included">
          {includedFeatures.map((item) => (
            <div className="sample-mockup-feature" key={item.title}>
              <span className="sample-mockup-feature-icon" aria-hidden="true">
                {item.icon === "calendar" ? "📅" : null}
                {item.icon === "hotel" ? "🏨" : null}
                {item.icon === "food" ? "🍜" : null}
                {item.icon === "plane" ? "✈️" : null}
                {item.icon === "budget" ? "💰" : null}
                {item.icon === "sparkles" ? "✨" : null}
                {item.icon === "map" ? "🗺️" : null}
                {item.icon === "tips" ? "✏️" : null}
                {item.icon === "shopping" ? "🛍️" : null}
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sample-mockup-cta">
        <div className="sample-mockup-cta-art" aria-hidden="true">
          <div className="sample-mockup-suitcase" />
          <div className="sample-mockup-camera" />
          <div className="sample-mockup-hat" />
        </div>
        <div className="sample-mockup-cta-copy">
          <h2>Ready to Plan Your Perfect Trip?</h2>
          <p>Join thousands of travelers who plan smarter with Travel Tuner.</p>
        </div>
        <button type="button" className="sample-mockup-cta-btn">
          Generate AI Itinerary <Sparkles size={16} /> <ArrowRight size={18} />
        </button>
      </section>

      <SiteFooter />
    </main>
  );
}
