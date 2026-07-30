"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Box,
  CarFront,
  ChevronDown,
  Hotel,
  MapPinned,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  UserRound,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
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
const handleGenerateTravelPlan = () => {
  window.location.href = "/generate-itinerary";
};
const includedFeatures = [
  {
    title: "Day-wise Itinerary",
    text: "Detailed plan for each day",
    icon: Ticket,
  },
  {
    title: "Stay Recommendations",
    text: "Best hotels for your budget",
    icon: Hotel,
  },
  {
    title: "Food Suggestions",
    text: "Local food to try",
    icon: UtensilsCrossed,
  },
  {
    title: "Transport Options",
    text: "Flights, trains & local transport",
    icon: CarFront,
  },
  { title: "Budget Breakdown", text: "Complete cost estimation", icon: Wallet },
  {
    title: "Attractions & Activities",
    text: "Top places & experiences",
    icon: Sparkles,
  },
  {
    title: "Google Maps Guides",
    text: "Hotel location guides",
    icon: MapPinned,
  },
  { title: "Travel Tips & Packing", text: "Packing & travel tips", icon: Box },
  { title: "Shopping Guide", text: "Best places to shop", icon: ShoppingBag },
];

const mobileTrust = [
  { title: "Secure & Trusted", icon: ShieldCheck },
  { title: "Instant Itinerary", icon: BadgeCheck },
  { title: "Expertly Curated", icon: Sparkles },
  { title: "Instant Download", icon: ArrowDownIcon },
];

const planFeatures = {
  silver: [
    "AI Generated Itinerary",
    "Day-wise travel plan",
    "Stay recommendations",
    "Food suggestions",
    "Transport options",
    "Budget breakdown",
  ],
  gold: [
    "Everything in Silver Plan",
    "Download itinerary as PDF",
    "Share on WhatsApp",
  ],
};

const faqs = [
  "Is my data safe with Travel Tuner?",
  "How accurate are the budgets?",
  "Can I customize the itinerary?",
  "Will I get hotel bookings too?",
  "Can I download the itinerary?",
  "Is there any subscription?",
  "What payment methods do you accept?",
  "How long does it take to generate?",
];

const accentColors = ["blue", "green", "amber", "violet", "indigo"];

function ArrowDownIcon(props: ComponentProps<typeof ArrowRight>) {
  return <ArrowRight {...props} style={{ transform: "rotate(90deg)" }} />;
}

export default function SampleItinerariesPage() {
  const [sampleItineraries, setSampleItineraries] = useState<SampleItinerary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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
    const term = query.trim().toLowerCase();

    return sampleItineraries
      .map((item, index) => {
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
          title:
            outputAny.destination ?? input.destination ?? "Sample itinerary",
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
      })
      .filter((card) => {
        if (!term) return true;
        return [card.title, card.tagline].some((value) =>
          String(value).toLowerCase().includes(term),
        );
      });
  }, [sampleItineraries, query]);

  return (
    <main className="sample-mockup-page">
      <SiteHeader backHref="/" backLabel="Back" />

      <section
        className="sample-mockup-mobile-shell"
        aria-label="Sample itinerary preview"
      >
        <section className="sample-mockup-mobile-hero">
          <h1>See What You&apos;ll Get</h1>
          <p>Explore AI-generated sample itineraries.</p>
        </section>

        <section
          className="sample-mockup-mobile-list"
          aria-label="Popular destinations"
        >
          {loading ? (
            <div className="sample-mockup-mobile-state">
              Loading sample itineraries...
            </div>
          ) : error ? (
            <div className="sample-mockup-mobile-state">{error}</div>
          ) : sampleCards.length ? (
            sampleCards.map((card) => (
              <article className="sample-mockup-destination-card" key={card.id}>
                <div className="sample-mockup-destination-media">
                  <img
                    src={card.image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.src = "/itinery_result.png";
                    }}
                  />
                  <span className={`sample-mockup-duration ${card.accent}`}>
                    {card.planLabel}
                  </span>
                </div>
                <div className="sample-mockup-destination-body">
                  <button
                    type="button"
                    className="sample-mockup-heart"
                    aria-label={`Save ${card.title}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 21s-7-4.35-9.5-8.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6.5C19 16.65 12 21 12 21Z" />
                    </svg>
                  </button>
                  <h3>{card.title}</h3>
                  <strong>
                    ₹{Number(card.budget || 0).toLocaleString("en-IN")}
                  </strong>
                  <p>
                    <UserRound size={14} />
                    <span>
                      {card.adults || 0} Adults · {card.children || 0} Child
                    </span>
                  </p>
                  <Link
                    href={`/result/${card.id}`}
                    className={`sample-mockup-view ${card.accent}`}
                  >
                    View Sample
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="sample-mockup-mobile-state">
              No sample itineraries found yet.
            </div>
          )}
        </section>

        <section className="sample-mockup-mobile-section">
          <div className="sample-mockup-mobile-section-title">
            Everything Included in Your Itinerary
          </div>
          <div className="sample-mockup-mobile-feature-grid">
            {includedFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div className="sample-mockup-mobile-feature" key={item.title}>
                  <span
                    className="sample-mockup-mobile-feature-icon"
                    aria-hidden="true"
                  >
                    <Icon size={24} />
                  </span>
                  <strong>{item.title}</strong>
                </div>
              );
            })}
          </div>
          <div className="sample-mockup-mobile-trust">
            {mobileTrust.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="sample-mockup-mobile-trust-item"
                  key={item.title}
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="cta-strip">
          <div>
            <strong>Ready to Plan Your Perfect Trip?</strong>
            <p>
              Join thousands of travelers who plan smarter with Travel Tuner.
            </p>
          </div>
          <button
            type="button"
            className="cta-strip-btn"
            onClick={handleGenerateTravelPlan}
          >
            ✨ Generate AI Itinerary <ArrowRight size={18} />
          </button>
        </section>
      </section>
      <section className="sample-mockup-desktop-only">
        <section className="sample-mockup-hero">
          <h1>See What You&apos;ll Get</h1>
          <p>Explore real sample itineraries pulled from the database.</p>
        </section>

        <section className="sample-mockup-grid" aria-label="Sample itineraries">
          {loading ? (
            <div
              className="sample-mockup-panel"
              style={{ gridColumn: "1 / -1" }}
            >
              Loading sample itineraries...
            </div>
          ) : error ? (
            <div
              className="sample-mockup-panel"
              style={{ gridColumn: "1 / -1" }}
            >
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
                    Budget: Rs{" "}
                    {Number(card.budget || 0).toLocaleString("en-IN")}
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
            <div
              className="sample-mockup-panel"
              style={{ gridColumn: "1 / -1" }}
            >
              No sample itineraries found yet.
            </div>
          )}
        </section>

        <section className="sample-mockup-panel">
          <h2>Everything Included in Your Itinerary</h2>
          <div className="sample-mockup-included">
            {includedFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div className="sample-mockup-feature" key={item.title}>
                  <span
                    className="sample-mockup-feature-icon"
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
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
            <p>
              Join thousands of travelers who plan smarter with Travel Tuner.
            </p>
          </div>
          <button
            type="button"
            className="sample-mockup-cta-btn"
            onClick={handleGenerateTravelPlan}
          >
            Generate AI Itinerary <Sparkles size={16} />{" "}
            <ArrowRight size={18} />
          </button>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
