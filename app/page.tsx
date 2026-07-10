"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  ChevronRight,
  Sparkles,
  TicketCheck,
  WalletCards,
  XCircle,
  LogOut,
  Bell,
  UserRound,
  Smartphone,
} from "lucide-react";
import { setLoginReturnPath } from "../lib/login-redirect";

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
  { name: "Silver", price: "9" },
  { name: "Gold", price: "49" },
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

export default function LandingPage() {
  const [user, setUser] = useState<UserInfo>(null);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            <Link href="/login" className="nav-login-pill">
              Login
            </Link>
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

                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <span className="landing-mobile-menu-item-icon">
                    <UserRound size={18} />
                  </span>
                  <strong>Login</strong>
                  <ChevronRight size={20} />
                </Link>
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

          <button
            type="button"
            className="generate-button"
            onClick={handleGenerateTravelPlan}
          >
            Generate My Travel Plan
            <ArrowRight size={24} />
          </button>

          <p className="payment-note">
            <ShieldCheck size={17} />
            Secure Payments. Instant Access.
          </p>
        </div>

        <div className="hero-photo" aria-label="Santorini travel preview">
          <img
            src="https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Travelers looking over a coastal Greek destination"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = "/default-avatar.svg";
            }}
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
                    <span className="plan-name">{plan.name}</span>
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
