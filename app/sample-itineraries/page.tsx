"use client";
import Link from "next/link";
import { ArrowRight, Plane, Sparkles } from "lucide-react";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

const sampleCards = [
  {
    id: "bali",
    title: "Bali",
    image: "/home-1.jpg",
    duration: "4 Days / 3 Nights",
    budget: "Budget: ₹95,200",
    travelers: "2 Adults · 1 Children",
    accent: "blue",
  },
  {
    id: "darjeeling",
    title: "Darjeeling",
    image: "/home-2.jpg",
    duration: "4 Days / 3 Nights",
    budget: "Budget: ₹37,100",
    travelers: "2 Adults · 1 Children",
    accent: "green",
  },
  {
    id: "rajasthan",
    title: "Rajasthan",
    image: "/home-3.jpg",
    duration: "7 Days / 6 Nights",
    budget: "Budget: ₹90,000",
    travelers: "2 Adults · 1 Children",
    accent: "amber",
  },
  {
    id: "goa",
    title: "Goa",
    image: "/home-4.jpg",
    duration: "5 Days / 4 Nights",
    budget: "Budget: ₹54,000",
    travelers: "2 Adults · 0 Children",
    accent: "violet",
  },
];

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

export default function SampleItinerariesPage() {
  return (
    <main className="sample-mockup-page">
      <SiteHeader backHref="/" backLabel="Back" />

      <section className="sample-mockup-hero">
        <h1>See What You&apos;ll Get</h1>
        <p>
          Explore sample itineraries created by our AI for amazing destinations.
        </p>
      </section>

      <section className="sample-mockup-grid" aria-label="Sample itineraries">
        {sampleCards.map((card) => (
          <article className="sample-mockup-card" key={card.id}>
            <div
              className="sample-mockup-card-media"
              style={{ backgroundImage: `url("${card.image}")` }}
            >
              <div className={`sample-mockup-duration ${card.accent}`}>
                {card.duration}
              </div>
              <h3>{card.title}</h3>
            </div>
            <div className="sample-mockup-card-body">
              <p>{card.budget}</p>
              <span>{card.travelers}</span>
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
        ))}
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

      <section className="sample-mockup-compare">
        <h2>Without Travel Tuner vs With Travel Tuner</h2>
        <div className="sample-mockup-compare-grid">
          <div className="sample-mockup-compare-card sample-mockup-compare-card-bad">
            <div className="sample-mockup-compare-title bad">
              <span>×</span>
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

          <div className="sample-mockup-vs">VS</div>

          <div className="sample-mockup-compare-card sample-mockup-compare-card-good">
            <div className="sample-mockup-compare-title good">
              <span>✓</span>
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
