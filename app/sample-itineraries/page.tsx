"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  X,
  Circle,
  Star,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Crown,
  Download,
  Edit3,
  Globe2,
  Hotel,
  Landmark,
  LockKeyhole,
  Map,
  Plane,
  Share2,
  ShieldCheck,
  ChevronRight,
  Medal,
  Sparkles,
  TicketCheck,
  Shield,
  Zap,
  Award,
  ChevronDown,
  WalletCards,
  XCircle,
  LogOut,
  Bell,
  UserRound,
  Smartphone,
} from "lucide-react";

type SampleItineraryRecord = {
  id: string;
  createdAt: string;
  isGlobal?: boolean;
  input?: {
    planId?: "silver" | "gold";
    adults?: number;
    children?: number;
    days?: number;
    destination?: string;
    budget?: number;
  };
  output?: {
    itinerary?: {
      destination?: string;
      tagline?: string;
      coverImageUrl?: string;
      summary?: string;
      totalEstimatedCost?: number;
      travelerInfo?: {
        adults?: number;
        children?: number;
      };
      days?: { day?: string; title?: string }[];
      planId?: "silver" | "gold";
    };
  };
};

type CardData = {
  id: string;
  title: string;
  image: string;
  planLabel: string;
  destinationType: string;
  priceLabel: string;
  travelerLabel: string;
  accent: "violet" | "green" | "amber" | "indigo";
  children: string;
  adults: string;
};

const accentMap: CardData["accent"][] = ["indigo", "green", "amber", "violet"];

const trustPoints = [
  {
    icon: Shield,
    title: "Secure & Trusted",
    text: "Your data is safe with us",
  },
  {
    icon: Zap,
    title: "Instant Itinerary",
    text: "Get your plan in seconds",
  },
  {
    icon: Award,
    title: "Expertly Curated",
    text: "By travel & local experts",
  },
  {
    icon: Download,
    title: "Instant Download (Gold Plan)",
    text: "Get PDF & share on WhatsApp",
  },
];

const includedFeatures = [
  {
    icon: CalendarDays,
    title: "Day-wise Itinerary",
    text: "Detailed plan for each day",
  },
  {
    icon: Hotel,
    title: "Stay Recommendations",
    text: "Best hotels for your budget",
  },
  { icon: Globe2, title: "Food Suggestions", text: "Local food to try" },
  {
    icon: Plane,
    title: "Transport Options",
    text: "Flights, trains & local transport",
  },
  {
    icon: CircleDollarSign,
    title: "Budget Breakdown",
    text: "Complete cost estimation",
  },
  {
    icon: Sparkles,
    title: "Attractions & Activities",
    text: "Top places & experiences",
  },
  { icon: Map, title: "Google Maps", text: "Hotel location guides" },
  { icon: Edit3, title: "Travel Tips", text: "Packing & travel tips" },
  { icon: LockKeyhole, title: "Shopping Guide", text: "Best places to shop" },
];

function formatDuration(days: number) {
  const safeDays = Number.isFinite(days) && days > 0 ? days : 4;
  const nights = Math.max(safeDays - 1, 0);
  return `${safeDays} Day${safeDays === 1 ? "" : "s"} / ${nights} Night${
    nights === 1 ? "" : "s"
  }`;
}
const handleGenerateTravelPlan = () => {
  window.location.href = "/generate-itinerary";
};
function resolveCard(item: SampleItineraryRecord, index: number): CardData {
  const output = item.output ?? {};
  const itinerary = output.itinerary ?? output;
  const input = item.input ?? {};

  const adults =
    itinerary.travelerInfo?.adults ??
    output.travelerInfo?.adults ??
    input.adults ??
    2;

  const children =
    itinerary.travelerInfo?.children ??
    output.travelerInfo?.children ??
    input.children ??
    0;

  const days = Number(
    input.days ?? itinerary.days?.length ?? output.days?.length ?? 4,
  );

  const destination =
    itinerary.destination ??
    output.destination ??
    input.destination ??
    "Sample";

  const totalEstimatedCost =
    itinerary.totalEstimatedCost ??
    output.totalEstimatedCost ??
    input.budget ??
    0;

  const coverImage =
    itinerary.coverImageUrl ?? output.coverImageUrl ?? "/itinery_result.png";

  const description =
    itinerary.tagline ??
    output.tagline ??
    itinerary.summary ??
    output.summary ??
    "Sample itinerary";

  const totalTravelers = Number(adults) + Number(children);

  return {
    id: item._id?.$oid ?? item._id ?? item.id,
    title: destination,
    image: coverImage,
    adults: adults,
    children: children,
    planLabel: formatDuration(days),
    destinationType: description,
    priceLabel: `Budget: ₹${Number(totalEstimatedCost).toLocaleString("en-IN")}`,
    travelerLabel: `For ${totalTravelers} Traveler${
      totalTravelers === 1 ? "" : "s"
    }`,
    accent: accentMap[index % accentMap.length],
  };
}

export default function SampleItinerariesPage() {
  const [items, setItems] = useState<SampleItineraryRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/home/sample-itineraries");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.itineraries || []);
    };

    load();
  }, []);

  const cards = useMemo(
    () => items.slice(0, 4).map((item, index) => resolveCard(item, index)),
    [items],
  );

  return (
    <main className="sample-itineraries-page">
      <section className="sample-itineraries-hero">
        <div className="sample-itineraries-wrap">
          <header className="sample-itineraries-header">
            <h1>See What You&apos;ll Get</h1>
            <p>
              Explore sample itineraries created by our AI for amazing
              destinations.
            </p>
          </header>

          <div className="sample-itineraries-grid sample-itineraries-grid--four">
            {cards.map((card, index) => (
              <article
                className="sample-itinerary-card sample-itinerary-card--large"
                key={card.id}
              >
                <div
                  className="sample-itinerary-image sample-itinerary-image--large"
                  style={{ backgroundImage: `url("${card.image}")` }}
                >
                  <div className={`sample-itinerary-pill ${card.accent}`}>
                    {card.planLabel}
                  </div>
                  <h3>{card.title}</h3>
                </div>
                <div className="sample-itinerary-body sample-itinerary-body--large">
                  <div className="sample-meta sample-meta--large">
                    {/* <strong>{card.destinationType}</strong> */}
                    <p>{card.priceLabel}</p>
                    <p>
                      {card.adults || 0} Adults · {card.children || 0} Children
                    </p>
                  </div>
                  <Link
                    href={`/result/${card.id}`}
                    className={`sample-view-btn ${card.accent}`}
                  >
                    View Sample <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <section className="included-section">
            <h2>Everything Included in Your Itinerary</h2>
            <div className="included-grid">
              {includedFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="included-item" key={item.title}>
                    <span className="included-icon">
                      <Icon size={18} />
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
          <section
            className="comparison-panel"
            aria-labelledby="comparison-title"
          >
            <h2 id="comparison-title">
              Without Travel Tuner vs With Travel Tuner
            </h2>
            <div className="comparison-grid">
              <div className="comparison-card comparison-card--bad">
                <div className="comparison-card-title">
                  <span className="comparison-icon comparison-icon--bad">
                    <X size={14} />
                  </span>
                  Without Travel Tuner
                </div>
                <ul>
                  <li>20+ tabs open</li>
                  <li>Hours of searching</li>
                  <li>Budget confusion</li>
                  <li>Missed experiences</li>
                  <li>Stressful planning</li>
                </ul>
              </div>

              <div className="comparison-vs">VS</div>

              <div className="comparison-card comparison-card--good">
                <div className="comparison-card-title">
                  <span className="comparison-icon comparison-icon--good">
                    <Check size={14} />
                  </span>
                  With Travel Tuner
                </div>
                <ul>
                  <li>AI-powered itinerary</li>
                  <li>Everything in one place</li>
                  <li>Accurate budget</li>
                  <li>Best experiences</li>
                  <li>Plan in under a minute!</li>
                </ul>
              </div>
            </div>
          </section>

          {/* <section className="stats-strip" aria-label="Travel Tuner stats">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div className="bottom-trust-item" key={point.title}>
                  <span className="bottom-trust-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{point.title}</strong>
                    <p>{point.text}</p>
                  </div>
                </div>
              );
            })}
          </section> */}
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

          <div className="sample-itineraries-footer">
            <Link href="/" className="sample-back-link">
              <Circle size={10} fill="currentColor" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
