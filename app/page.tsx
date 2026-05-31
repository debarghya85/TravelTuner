import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
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
  Sparkles,
  TicketCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Smart & Personalized",
    text: "Itinerary tailored to your preferences",
  },
  {
    icon: CalendarDays,
    title: "Instant Itinerary Generation",
    text: "Get your plan in less than a minute",
  },
  {
    icon: WalletCards,
    title: "Pay & Access",
    text: "One-time payment per itinerary",
  },
];

const tripPreview = [
  { icon: CalendarDays, day: "Day 1", text: "Arrival & Local Exploration" },
  { icon: Landmark, day: "Day 2", text: "Nature & Adventure" },
  { icon: Map, day: "Day 3", text: "Culture & Sightseeing" },
  { icon: TicketCheck, day: "Day 4", text: "Leisure & Shopping" },
];

const steps = [
  {
    icon: Plane,
    title: "1. Tell Us About Your Trip",
    text: "Share your destination, dates & preferences",
  },
  {
    icon: CalendarDays,
    title: "2. We Build Your Itinerary",
    text: "Our AI creates the perfect day-by-day plan",
  },
  {
    icon: ShieldCheck,
    title: "3. Pay to Generate",
    text: "Choose a plan and make a secure payment",
  },
  {
    icon: LockKeyhole,
    title: "4. Get Your Itinerary",
    text: "Instant access to your full travel plan",
  },
];

const plans = [
  { name: "Basic Plan", price: "9" },
  { name: "Premium Plan", price: "49" },
];

const pricingFeatures = [
  {
    icon: Sparkles,
    name: "AI-Powered Itinerary Generation",
    availability: [true, true],
  },
  {
    icon: CalendarDays,
    name: "Day-by-Day Itinerary",
    availability: [true, true],
  },
  {
    icon: TicketCheck,
    name: "Top Attractions & Activities",
    availability: [true, true],
  },
  {
    icon: Hotel,
    name: "Hotel / Stay Recommendations",
    availability: [true, true],
  },
  {
    icon: Globe2,
    name: "Restaurant and Food Recommendations",
    availability: [true, true],
  },
  {
    icon: Plane,
    name: "Local Transport Details",
    availability: [true, true],
  },
  {
    icon: CircleDollarSign,
    name: "Budget Estimate",
    availability: [true, true],
  },
  {
    icon: Share2,
    name: "Share Itinerary",
    availability: [false, true],
  },
  {
    icon: Download,
    name: "Download as PDF",
    availability: [false, true],
  },
  {
    icon: Edit3,
    name: "Re-generate / Edit Itinerary",
    availability: [false, true],
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <img
          src="/tt_logo.png"
          alt="Travel Tuner"
          className="form-logo logo-small"
        />

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <Link href="/login" className="login-button">
          Login
        </Link>
      </header>

      <section
        className="landing-hero landing-hero-padding"
        aria-labelledby="landing-title"
      >
        <div className="hero-copy">
          <div className="hero-kicker">
            <BadgeCheck size={16} />
            AI-Powered Travel Itinerary Planner
          </div>

          <h2 id="landing-title">
            Your Perfect Trip,
            <br />
            Planned in <span>Seconds</span>
          </h2>

          <p className="hero-text">
            Get a personalized day-by-day itinerary in seconds. Pay once, get
            your plan, and travel stress-free.
          </p>

          <div className="landing-benefits">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div className="landing-benefit" key={benefit.title}>
                  <span>
                    <Icon size={19} />
                  </span>
                  <div>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/generate-itinerary" className="generate-button">
            Generate My Itinerary
            <ArrowRight size={24} />
          </Link>

          <p className="payment-note">
            <ShieldCheck size={17} />
            Secure Payments. Instant Access.
          </p>
        </div>

        <div className="hero-photo" aria-label="Santorini travel preview">
          <img
            src="https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Travelers looking over a coastal Greek destination"
          />

          <div className="trip-preview-card">
            <h2>Your Trip at a Glance</h2>
            {tripPreview.map((item) => {
              const Icon = item.icon;
              return (
                <div className="trip-preview-row" key={item.day}>
                  <span>
                    <Icon size={20} />
                  </span>
                  <div>
                    <strong>{item.day}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <h2>How It Works</h2>
        <div className="workflow">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="workflow-step" key={step.title}>
                <span className="workflow-icon">
                  <Icon size={25} />
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
                {index < steps.length - 1 ? (
                  <ArrowRight className="workflow-arrow" size={22} />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section
        className="pricing-section"
        id="pricing"
        aria-labelledby="pricing-title"
      >
        <div className="pricing-header">
          <h2 id="pricing-title">Compare Plans</h2>
          <p>Choose the itinerary plan that fits the way you travel.</p>
        </div>

        <div className="pricing-table-wrap">
          <table className="pricing-table">
            <thead>
              <tr>
                <th scope="col">Features</th>
                {plans.map((plan) => (
                  <th scope="col" key={plan.name}>
                    <span className="plan-name">
                      {plan.name}
                    </span>
                    <strong>
                      <span>Rs</span> {plan.price}
                    </strong>
                    <em>Per Itinerary</em>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <tr key={feature.name}>
                    <th scope="row">
                      <Icon size={18} />
                      <span>{feature.name}</span>
                    </th>
                    {feature.availability.map((isAvailable, index) => (
                      <td key={`${feature.name}-${plans[index].name}`}>
                        {isAvailable ? (
                          <CheckCircle2
                            className="available-icon"
                            size={17}
                            aria-label="Included"
                          />
                        ) : (
                          <XCircle
                            className="unavailable-icon"
                            size={17}
                            aria-label="Not included"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <span id="destinations" className="landing-anchor" />
      <span id="reviews" className="landing-anchor" />
    </main>
  );
}
