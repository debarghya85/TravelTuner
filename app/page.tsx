"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
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
import { setLoginReturnPath } from "../lib/login-redirect";

type SampleItinerary = {
  id: string;
  createdAt: string;
  input?: {
    planId?: "silver" | "gold";
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
    };
  };
};

type UserInfo = {
  id: string;
  provider: "google" | "facebook" | "email" | "unknown";
  providerId: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
} | null;

function UserAvatar({
  src,
  alt,
  className,
  fallbackClassName = "nav-avatar-fallback",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const imageSrc = src || "/default-avatar.svg";
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="eager"
      decoding="async"
      onError={(event) => {
        const target = event.currentTarget;
        if (target.dataset.fallbackApplied === "1") return;
        target.dataset.fallbackApplied = "1";
        target.src = "/default-avatar.svg";
        target.className = className
          ? `${className} ${fallbackClassName}`
          : fallbackClassName;
      }}
    />
  );
}

const benefits = [
  {
    icon: Sparkles,
    title: "Smart & Personalized",
    text: "Customized for your travel style, budget, and interests.",
  },
  {
    icon: CalendarDays,
    title: "Instant Itinerary Generation",
    text: "Get a complete AI-powered itinerary in under a minute.",
  },
  {
    icon: WalletCards,
    title: "Complete Travel Planning",
    text: "Includes stay recommendations, travel routes, budgets, local food, and sightseeing.",
  },
];

const tripPreview = [
  { icon: CalendarDays, day: "Day 1", text: "Arrival & Local Exploration" },
  { icon: Landmark, day: "Day 2", text: "Nature & Adventure" },
  { icon: Map, day: "Day 3", text: "Culture & Sightseeing" },
  { icon: TicketCheck, day: "Day 4", text: "Leisure & Shopping" },
];

const heroImages = [
  "/home-1.jpg",
  "/home-2.jpg",
  "/home-3.jpg",
  "/home-4.jpg",
  "/home-5.jpg",
  "/home-6.jpg",
  "/home-7.jpg",
  "/home-8.jpg",
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
  {
    name: "Silver",
    price: "9",
    icon: Medal,
    tone: "silver" as const,
  },
  {
    name: "Gold",
    price: "49",
    icon: Crown,
    tone: "gold" as const,
    badge: "BEST VALUE",
  },
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
  { icon: Plane, name: "Local Transport Details", availability: [true, true] },
  {
    icon: CircleDollarSign,
    name: "Budget Estimate",
    availability: [true, true],
  },
  { icon: Share2, name: "Share Itinerary", availability: [false, true] },
  { icon: Download, name: "Download as PDF", availability: [false, true] },
];

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

const stats = [
  { value: "1,250+", label: "Itineraries Generated" },
  { value: "98%", label: "Happy Travelers" },
  { value: "4.8★", label: "Average Rating" },
  { value: "50+", label: "Destinations Covered" },
];

const faqs = [
  {
    question: "Is my data safe with Travel Tuner?",
    answer:
      "Yes. Your information is used only to generate your itinerary and process your request. Payments are handled securely through Razorpay.",
  },
  {
    question: "How accurate are the budgets?",
    answer:
      "The budgets are estimated based on your destination, trip duration, travel style, transport, stay, food, and activities. Actual prices may vary depending on availability and travel dates.",
  },
  {
    question: "Can I customize the itinerary?",
    answer:
      "Yes. You can choose your destination, number of days, budget, travel style, travellers, interests, and preferences before generating the itinerary.",
  },
  {
    question: "Will I get hotel bookings too?",
    answer:
      "Travel Tuner provides hotel and stay recommendations, but it does not currently make bookings on your behalf.",
  },
  {
    question: "Can I download the itinerary?",
    answer:
      "Yes. The Gold plan allows you to download the itinerary as a PDF and share it with others through Whatsapp.",
  },
  {
    question: "Is there any subscription?",
    answer:
      "No. Travel Tuner does not require a subscription. You only pay for the itinerary as per the plan selected.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Payments are processed securely through Razorpay and may include UPI, credit cards, debit cards, net banking, and supported wallets.",
  },
  {
    question: "How long does it take to generate?",
    answer:
      "Most itineraries are generated within a minute, depending on the trip details, Number of days and server availability.",
  },
];

export default function LandingPage() {
  const [user, setUser] = useState<UserInfo>(null);
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [sampleItineraries, setSampleItineraries] = useState<SampleItinerary[]>(
    [],
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadSamples = async () => {
      const res = await fetch("/api/home/sample-itineraries");
      if (!res.ok) return;
      const data = await res.json();
      setSampleItineraries((data.itineraries || []).slice(0, 3));
    };

    loadSamples();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length);
    }, 9500);

    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  const handleGenerateTravelPlan = () => {
    if (user) {
      window.location.href = "/generate-itinerary";
      return;
    }

    setLoginReturnPath("/generate-itinerary");
    window.location.href = "/login";
  };

  const handleDirectLogin = () => {
    window.location.href = "/api/auth/start/google?returnTo=%2F";
  };

  const openSampleResult = (id: string) => {
    window.location.href = `/result/${id}`;
  };

  const accentColors = ["indigo", "amber", "green"];

  const sampleCards = sampleItineraries.map((item, index) => {
    const output = item.output ?? {};
    const input = item.input ?? {};

    const adults = output.travelerInfo?.adults ?? input.adults ?? 0;
    const children = output.travelerInfo?.children ?? input.children ?? 0;

    const days = Number(input.days ?? output.days?.length ?? 0);
    const nights = Math.max(days - 1, 0);

    const planId = output.planId ?? output.itinerary?.planId ?? input.planId;

    return {
      id: item._id?.$oid ?? item._id ?? item.id,

      title: output.destination ?? input.destination ?? "Sample itinerary",

      tagline: output.tagline ?? output.summary ?? "Global sample itinerary",

      image: output.coverImageUrl ?? "/itinery_result.png",

      budget: output.totalEstimatedCost ?? input.budget ?? 0,

      travelers: adults + children,

      adults,

      children,

      planLabel: `${days} ${days === 1 ? "Day" : "Days"} / ${nights} ${
        nights === 1 ? "Night" : "Nights"
      }`,

      accent: accentColors[index % accentColors.length],

      planId,
    };
  });

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
          {user ? (
            <>
              <Link href="/itineraries">My Travel Plans</Link>
              <div className="nav-profile-wrap" ref={profileRef}>
                <button
                  className="nav-profile-pill"
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="nav-avatar">
                    <UserAvatar
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="nav-avatar-img"
                    />
                  </span>
                  <span className="nav-profile-copy">
                    <strong>
                      {user.displayName || user.email || "Traveler"}
                    </strong>
                    <small>
                      <span className="status-dot" />
                      {user.provider === "unknown"
                        ? "Logged in"
                        : `Logged in with ${user.provider}`}
                    </small>
                  </span>
                </button>

                {profileOpen ? (
                  <div className="nav-profile-menu" role="menu">
                    <div className="nav-profile-menu-head">
                      <span>Signed in with</span>
                      <strong>
                        {user.displayName || user.email || "Traveler"}
                      </strong>
                    </div>

                    <Link
                      href="/itineraries"
                      className="nav-profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <CalendarDays size={18} />
                      <div>
                        <strong>My Travel Plans</strong>
                        <span>View all your saved trips</span>
                      </div>
                    </Link>

                    {/* <Link href="/" className="nav-profile-menu-item" onClick={() => setProfileOpen(false)}>
                      <UserRound size={18} />
                      <div>
                        <strong>Account</strong>
                        <span>Manage your preferences</span>
                      </div>
                    </Link> */}

                    <button
                      className="nav-profile-menu-item logout"
                      type="button"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      <div>
                        <strong>Logout</strong>
                        <span>Sign out from Travel Tuner</span>
                      </div>
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <button
              type="button"
              className="gsi-material-button header-google-login"
              onClick={handleDirectLogin}
              aria-label="Sign in with Google"
            >
              <div className="gsi-material-button-state" />
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon" aria-hidden="true">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    style={{ display: "block" }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  Sign in with Google
                </span>
                <span style={{ display: "none" }}>Sign in with Google</span>
              </div>
            </button>
          )}
        </nav>

        <div className="landing-mobile-actions">
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            className="result-menu-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={`landing-mobile-menu${user ? " is-logged-in" : ""}`}
            id="landing-mobile-menu"
            role="menu"
          >
            {user ? (
              <>
                <div className="landing-mobile-menu-user-card">
                  <span className="landing-mobile-menu-user-avatar">
                    <UserAvatar
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="landing-mobile-menu-user-avatar-img"
                      fallbackClassName="landing-mobile-menu-user-avatar-fallback"
                    />
                  </span>
                  <div>
                    <strong>
                      {user.displayName || user.email || "Traveler"}
                    </strong>
                    <p>
                      {user.provider === "unknown"
                        ? "Logged in"
                        : `Logged in with ${user.provider}`}
                    </p>
                  </div>
                </div>

                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <Bell size={18} />
                  </span>
                  <strong>How It Works</strong>
                  <ChevronRight size={20} />
                </a>

                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                  <span className="landing-mobile-menu-item-icon">
                    <CircleDollarSign size={18} />
                  </span>
                  <strong>Pricing</strong>
                  <ChevronRight size={20} />
                </a>

                <Link
                  href="/itineraries"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <TicketCheck size={18} />
                  </span>
                  <strong>My Travel Plans</strong>
                  <ChevronRight size={20} />
                </Link>

                <button
                  type="button"
                  className="landing-mobile-menu-logout"
                  onClick={handleLogout}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <LogOut size={18} />
                  </span>
                  <strong>Logout</strong>
                </button>
              </>
            ) : (
              <>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <Bell size={18} />
                  </span>
                  <strong>How It Works</strong>
                  <ChevronRight size={20} />
                </a>

                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                  <span className="landing-mobile-menu-item-icon">
                    <CircleDollarSign size={18} />
                  </span>
                  <strong>Pricing</strong>
                  <ChevronRight size={20} />
                </a>

                <button
                  type="button"
                  className="landing-mobile-menu-login"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDirectLogin();
                  }}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <UserRound size={18} />
                  </span>
                  <strong>Login</strong>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </>
      ) : null}

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
            Plan Your Perfect Trip in Under a <span>Minute</span>
          </h2>

          <p className="hero-text">
            Tell us where you're going, and our AI creates a personalized
            itinerary with hotels, transport, food, sightseeing, and budget
            planning—all in under a minute.
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

          <button
            type="button"
            className="plan-trip-btn"
            onClick={handleGenerateTravelPlan}
          >
            ✨ Generate AI Itinerary
            <ArrowRight size={24} />
          </button>

          <p className="payment-note">
            🔒 Secure Google Sign-In • One-Time Payment • AI-Generated Itinerary
          </p>
        </div>

        <div className="hero-photo" aria-label="Santorini travel preview">
          <div className="hero-slides" aria-hidden="true">
            {heroImages.map((image, index) => (
              <div
                key={image}
                className={`hero-slide ${index === activeHeroImage ? "hero-slide-active" : ""}`}
                style={{ backgroundImage: `url("${image}")` }}
              />
            ))}
          </div>

          <div className="hero-photo-overlay" aria-hidden="true" />

          <div className="trip-preview-card">
            <h2>Your AI Itinerary Preview</h2>
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

          <div className="hero-dots" aria-label="Choose destination image">
            {heroImages.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`hero-dot ${index === activeHeroImage ? "hero-dot-active" : ""}`}
                aria-label={`Show travel image ${index + 1}`}
                aria-current={index === activeHeroImage ? "true" : undefined}
                onClick={() => setActiveHeroImage(index)}
              />
            ))}
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
        className="see-what-you-get"
        aria-labelledby="sample-itineraries-title"
      >
        <div className="section-heading">
          <span className="section-kicker">✨</span>
          <h2 id="sample-itineraries-title">See What You'll Get</h2>
        </div>
        <p className="section-subtitle">
          Explore sample itineraries created by our AI for amazing destinations.
        </p>

        <div className="sample-itineraries-grid">
          {sampleCards.map((card) => (
            <article className="sample-itinerary-card" key={card.id}>
              <div
                className="sample-itinerary-image"
                style={{ backgroundImage: `url("${card.image}")` }}
              >
                <div className={`sample-itinerary-pill ${card.accent}`}>
                  {card.planLabel}
                </div>
                <h3>{card.title}</h3>
              </div>
              <div className="sample-itinerary-body">
                <div className="sample-tags">
                  <span>Beaches</span>
                  <span>Nightlife</span>
                  <span>Seafood</span>
                </div>
                <div className="sample-meta">
                  <strong>
                    Budget: ₹{card.budget.toLocaleString("en-IN")}
                  </strong>
                  <p>(For {card.adults} Adults)</p>
                </div>
                <button
                  type="button"
                  className={`sample-view-btn ${card.accent}`}
                  onClick={() => openSampleResult(card.id)}
                >
                  View Sample <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <a className="view-all-samples" href="/itineraries">
          View All Sample Itineraries <ArrowRight size={16} />
        </a>
      </section>

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

      <section className="stats-strip" aria-label="Travel Tuner stats">
        {stats.map((item) => (
          <div className="stat-item" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="pricing-faq-grid">
        <div className="pricing-stack">
          <h2>Simple & Transparent Pricing</h2>
          <div className="pricing-cards">
            {plans.map((plan, planIndex) => (
              <div
                key={plan.name}
                className={`price-card ${plan.tone} ${planIndex === 1 ? "featured" : ""}`}
              >
                {planIndex === 1 ? (
                  <div className="price-badge">A Most Popular</div>
                ) : null}
                <div className="price-title">{plan.name} Plan</div>
                <div className="price-value">
                  <span>₹</span>
                  {plan.price}
                </div>
                <div className="price-subtitle">One-time payment</div>
                <ul className="price-list">
                  {(planIndex === 0
                    ? [
                        "AI Generated Itinerary",
                        "Day-wise travel plan",
                        "Stay recommendations",
                        "Food suggestions",
                        "Transport options",
                        "Budget breakdown",
                      ]
                    : [
                        "Everything in Silver Plan",
                        "Download itinerary as PDF",
                        "Share on WhatsApp",
                      ]
                  ).map((line) => (
                    <li key={line}>✓ {line}</li>
                  ))}
                </ul>
                <button type="button" className={`price-cta ${plan.tone}`}>
                  {planIndex === 0 ? "Choose Silver Plan" : "Choose Gold Plan"}
                </button>
              </div>
            ))}
          </div>
          <div className="pricing-badges">
            <span>🔒 Secure Payment</span>
            <span>🛡️ Razorpay Secured</span>
            <span>✅ 100% Safe</span>
          </div>
        </div>

        <div className="faq-stack">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <button
                key={faq.question}
                type="button"
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                <ChevronDown size={16} />
                {openFaq === index ? (
                  <div className="faq-answer">{faq.answer}</div>
                ) : null}
              </button>
            ))}
          </div>
          <div className="faq-help">
            <strong>Still have questions?</strong>
            <p>We’re here to help you plan your perfect trip.</p>
            <a
              className="faq-support-btn"
              href="mailto:traveltuner.85@gmail.com"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <section className="cta-strip">
        <div>
          <strong>Ready to Plan Your Perfect Trip?</strong>
          <p>Join thousands of travelers who plan smarter with Travel Tuner.</p>
        </div>
        <button
          type="button"
          className="cta-strip-btn"
          onClick={handleGenerateTravelPlan}
        >
          Generate My Itinerary <ArrowRight size={18} />
        </button>
      </section>

      <section className="bottom-trust-row">
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
      </section>

      <section
        className="pricing-section"
        id="pricing"
        aria-labelledby="pricing-title"
      >
        <div className="pricing-hero">
          <div className="pricing-header">
            <h2 id="pricing-title">Compare Plans</h2>
            <p>
              Choose the itinerary plan that fits the way{" "}
              <span className="pricing-highlight">your</span> travel.
            </p>
          </div>
        </div>

        <div className="pricing-card">
          <div className="pricing-grid">
            <div className="pricing-features-panel">
              <div className="pricing-feature-header">Features</div>
              <div className="pricing-feature-list">
                {pricingFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div className="pricing-feature-row" key={feature.name}>
                      <span className="feature-icon-box">
                        <Icon size={16} />
                      </span>
                      <span>{feature.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {plans.map((plan) => {
              const availabilityColumn = pricingFeatures.map((feature) => {
                return feature.availability[
                  plans.findIndex((p) => p.name === plan.name)
                ];
              });

              return (
                <div
                  key={plan.name}
                  className={`pricing-plan-panel plan-${plan.tone}`}
                >
                  <div className="pricing-plan-head">
                    <span className="plan-name">
                      <span className={`plan-icon plan-icon-${plan.tone}`}>
                        <plan.icon size={15} />
                      </span>
                      {plan.name}
                    </span>
                    <strong>
                      <span>Rs</span> {plan.price}
                    </strong>
                    <em>Per Itinerary</em>
                  </div>

                  <div className="pricing-plan-body">
                    {availabilityColumn.map((isAvailable, index) => (
                      <div
                        className="pricing-plan-row"
                        key={`${plan.name}-${pricingFeatures[index].name}`}
                      >
                        {isAvailable ? (
                          <CheckCircle2
                            className="available-icon"
                            size={18}
                            aria-label="Included"
                          />
                        ) : (
                          <XCircle
                            className="unavailable-icon"
                            size={18}
                            aria-label="Not included"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pricing-footer">
            <div className="trust-row">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div className="trust-point" key={point.title}>
                    <span className="trust-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <strong>{point.title}</strong>
                      <p>{point.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* <div className="action-cell">
              <button type="button" className="plan-action">
                Choose Silver
                <span>Perfect for quick trips</span>
              </button>
            </div>
            <div className="action-cell">
              <button type="button" className="plan-action is-selected">
                Choose Gold
                <span>Best experience. All features.</span>
              </button>
            </div> */}
          </div>
        </div>
      </section>

      <span id="destinations" className="landing-anchor" />
      <span id="reviews" className="landing-anchor" />
    </main>
  );
}
