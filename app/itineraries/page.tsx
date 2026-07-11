"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Heart,
  Home,
  LogOut,
  MapPin,
  Trophy,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { setLoginReturnPath } from "../../lib/login-redirect";

type ItineraryRecord = {
  id: string;
  createdAt: string;
  input?: {
    planId?: "view-only" | "premium";
  };
  output: {
    itinerary?: {
      destination?: string;
      tagline?: string;
      coverImagePrompt?: string;
      coverImageUrl?: string;
      summary?: string;
      days?: { day?: string; title?: string }[];
      totalEstimatedCost?: number;
      travelerInfo?: {
        adults?: number;
        children?: number;
        pricingCalculatedFor?: string;
      };
    };
  };
};

type ItineraryPreview = {
  destination?: string;
  tagline?: string;
  coverImagePrompt?: string;
  coverImageUrl?: string;
  summary?: string;
  planId?: "view-only" | "premium";
  days?: { day?: string; title?: string }[];
  totalEstimatedCost?: number;
  travelerInfo?: {
    adults?: number;
    children?: number;
    pricingCalculatedFor?: string;
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
  fallbackClassName,
}: {
  src?: string | null;
  alt: string;
  className: string;
  fallbackClassName: string;
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
        target.className = `${className} ${fallbackClassName}`;
      }}
    />
  );
}

type CardData = {
  id: string;
  image: string;
  status: "" | "" | "";
  title: string;
  tagline: string;
  subtitle: string;
  planId: "view-only" | "premium";
  daysCount: number;
  adults: number;
  children: number;
  totalEstimatedCost: number;
  date: string;
  action: "View Travel Plan" | "Continue Planning";
  tone: "" | "" | "";
};

export default function ItineraryListPage() {
  const [user, setUser] = useState<UserInfo>(null);
  const [items, setItems] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, tripsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/itineraries"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setItems(tripsData.itineraries || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const itinerary = (item.output?.itinerary ||
        item.output) as ItineraryPreview;
      return [
        itinerary.destination,
        itinerary.summary,
        new Date(item.createdAt).toLocaleDateString(),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [items, query]);

  const cards: CardData[] = useMemo(
    () =>
      filteredItems.map((item, index) => {
        const itinerary = (item.output?.itinerary ||
          item.output) as ItineraryPreview;
        const daysCount = itinerary.days?.length || 12;
        const adults = itinerary.travelerInfo?.adults ?? 2;
        const children = itinerary.travelerInfo?.children ?? 0;
        const totalEstimatedCost = itinerary.totalEstimatedCost ?? 126000;
        const status = "";
        const planId = (item.input?.planId ||
          itinerary.planId ||
          "view-only") as "view-only" | "premium";

        return {
          id: item.id,
          image: itinerary.coverImageUrl || "/itinery_result.png",
          status,
          title: itinerary.destination || "Trip itinerary",
          tagline: itinerary.tagline,
          subtitle:
            itinerary.summary ||
            itinerary.travelerInfo?.pricingCalculatedFor ||
            "Saved itinerary",
          planId,
          daysCount,
          adults,
          children,
          totalEstimatedCost,
          date: new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          action: "View Travel Plan",
          tone: "",
        };
      }),
    [filteredItems],
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleCreateTravelPlan = () => {
    if (user) {
      window.location.href = "/generate-itinerary";
      return;
    }

    setLoginReturnPath("/generate-itinerary");
    window.location.href = "/login";
  };

  return (
    <main className="itineraries-shell scenic-shell" id="top">
      <section className="itineraries-mobile-stack">
        <header className="itineraries-mobile-header1 result-mobile-header">
          <Link href="/" className="result-mobile-logo">
            <img
              src="/tt_logo.png"
              alt="Travel Tuner"
              className="form-logo logo-small"
            />
          </Link>

          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-controls="itineraries-mobile-menu"
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
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
              className="landing-mobile-menu result-mobile-menu is-logged-in"
              id="itineraries-mobile-menu"
              role="menu"
            >
              <div className="landing-mobile-menu-user-card">
                <span className="landing-mobile-menu-user-avatar">
                  <UserAvatar
                    src={user?.photoURL}
                    alt={user?.displayName || "User"}
                    className="landing-mobile-menu-user-avatar-img"
                    fallbackClassName="landing-mobile-menu-user-avatar-fallback"
                  />
                </span>
                <div>
                  <strong>
                    {user?.displayName || user?.email || "Traveler"}
                  </strong>
                  <p>
                    {user?.provider === "unknown"
                      ? "Logged in"
                      : `Logged in with ${user?.provider || "account"}`}
                  </p>
                </div>
              </div>

              <div className="landing-mobile-menu-links">
                <Link
                  href="/"
                  className="landing-mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <Home size={18} />
                  </span>
                  <strong>Home</strong>
                  <span className="landing-mobile-menu-link-arrow">›</span>
                </Link>

                <Link
                  href="/itineraries"
                  className="landing-mobile-menu-link active"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <CalendarDays size={18} />
                  </span>
                  <strong>My Travel Plans</strong>
                  <span className="landing-mobile-menu-link-arrow">›</span>
                </Link>

                <button
                  type="button"
                  className="landing-mobile-menu-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCreateTravelPlan();
                  }}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <Sparkles size={18} />
                  </span>
                  <strong>Plan Another Trip</strong>
                  <span className="landing-mobile-menu-link-arrow">›</span>
                </button>
              </div>

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
            </div>
          </>
        ) : null}

        <section className="itineraries-mobile-hero">
          <div className="itineraries-mobile-title">
            <CalendarDays size={54} />
            <div>
              <h1>My Travel Plans</h1>
              <p>Manage and revisit all your saved trips.</p>
            </div>
          </div>

          <button
            type="button"
            className="itineraries-mobile-cta"
            onClick={handleCreateTravelPlan}
          >
            <span>
              <span className="itineraries-mobile-cta-icon">
                <MapPin
                  size={20}
                  strokeWidth={2.6}
                  className="itineraries-mobile-cta-icon-svg"
                />
              </span>
              <strong>Plan Another Trip</strong>
            </span>
            <ArrowRight size={28} />
          </button>

          <label className="itinerary-search itineraries-mobile-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by destination..."
            />
          </label>
        </section>

        <section className="itineraries-mobile-list">
          {cards.map((card) => (
            <article className="itineraries-mobile-card" key={card.id}>
              <div className="itineraries-mobile-card-image">
                <img
                  src={card.image}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = "/itinery_result.png";
                  }}
                />
              </div>
              <div className="itineraries-mobile-card-body">
                <h2>{card.title}</h2>
                <p>{card.tagline || card.subtitle}</p>
                <div className="itineraries-mobile-card-meta">
                  <div>
                    <CalendarDays size={14} />
                    <span>{card.daysCount} Days</span>
                    <span className="divider" />
                    <span>
                      Total ₹{card.totalEstimatedCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <UserRound size={14} />
                    <span>
                      {card.adults} Adults {card.children} Children
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/result/${card.id}`}
                className="itineraries-mobile-card-link"
              >
                <ChevronRight size={28} />
              </Link>
            </article>
          ))}

          {!loading && !cards.length ? (
            <div className="saved-empty itineraries-empty">
              <h3>No itineraries found</h3>
              <p>Try a different search, or generate your first trip plan.</p>
              <button
                className="premium-button"
                type="button"
                onClick={handleCreateTravelPlan}
              >
                <MapPin size={16} />
                <span>Create your first travel plan</span>
              </button>
            </div>
          ) : null}
        </section>

        <div className="itineraries-mobile-footer">
          <div className="itineraries-mobile-footer-card">
            <Sparkles size={34} />
            <div>
              <strong>Plan smarter, travel better</strong>
              <p>
                Let our AI craft the perfect itinerary for your next adventure.
              </p>
            </div>
            <ChevronRight size={26} />
          </div>

          <a href="#top" className="itineraries-mobile-top">
            <span>↑</span>
          </a>
        </div>
      </section>

      <aside className="itineraries-sidebar">
        <div className="brand-lockup itineraries-brand">
          <img src="/tt_logo.png" alt="Travel Tuner" />
          <span>
            <Sparkles size={14} />
            AI-Powered Travel Planner
          </span>
        </div>

        <nav className="itineraries-nav">
          <Link href="/" className="itineraries-nav-item">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link href="/itineraries" className="itineraries-nav-item active">
            <CalendarDays size={18} />
            <span>My Travel Plans</span>
          </Link>
        </nav>

        <div className="premium-card">
          <div className="premium-top">
            <Sparkles size={17} />
            <strong>Plan smarter, travel better</strong>
          </div>
          <p>
            Let our AI craft the perfect itinerary for your next adventure..
          </p>
          <button
            type="button"
            className="premium-button"
            onClick={handleCreateTravelPlan}
          >
            <MapPin size={16} />
            <span>Plan Another Trip</span>
          </button>
        </div>
      </aside>

      <section className="itineraries-stage">
        <header className="itineraries-header">
          <div className="itineraries-title">
            <CalendarDays size={36} />
            <div>
              <h1>My Travel Plans</h1>
              <p>Manage and revisit all your saved trips.</p>
            </div>
          </div>

          <div className="account-wrap">
            <button
              type="button"
              className="account-pill"
              onClick={() => setAccountOpen((v) => !v)}
            >
              <span className="account-pill-icon">
                <UserAvatar
                  src={user?.photoURL}
                  alt={user?.displayName || "User"}
                  className="account-pill-avatar"
                  fallbackClassName="account-pill-avatar-fallback"
                />
              </span>
              <span className="account-pill-text">
                {user?.displayName || user?.email || "Traveler"}
              </span>
              <ChevronDown size={18} />
            </button>

            {accountOpen ? (
              <div className="account-menu">
                <p>Signed in with</p>
                <strong>
                  {user?.displayName || user?.email || "Traveler"}
                </strong>
                <span className="verified-row">
                  <UserRound size={16} />
                  {user?.provider === "unknown"
                    ? "Logged in"
                    : `Logged in with ${user.provider}`}
                </span>

                <button
                  type="button"
                  className="account-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>
                    <strong>Logout</strong>
                    <small>Sign out from Travel Tuner</small>
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <section className="itineraries-panel">
          <div className="itineraries-toolbar">
            <label className="itinerary-search">
              <Search size={20} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your itineraries..."
              />
            </label>

            <button type="button" className="filter-pill active">
              All Trips <ChevronDown size={16} />
            </button>
            <button type="button" className="filter-pill">
              Sort: Recently Added <ChevronDown size={16} />
            </button>
          </div>

          {loading ? (
            <div className="saved-state itineraries-state">
              Loading itineraries...
            </div>
          ) : null}

          <section className="itineraries-grid">
            {cards.map((card) => (
              <article className="itinerary-card" key={card.id}>
                <div className={`itinerary-visual tone-${card.tone}`}>
                  <img
                    src={card.image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.src = "/itinery_result.png";
                    }}
                  />
                  <div
                    className={`itinerary-plan-pill overlay ${card.planId === "premium" ? "is-gold" : "is-silver"}`}
                  >
                    <Trophy size={16} />
                  </div>
                </div>

                <div className="itinerary-card-body">
                  <h2>{card.title}</h2>
                  <p className="itinerary-tagline">{card.tagline}</p>
                  <div className="itinerary-details">
                    <div className="itinerary-info">
                      <div className="itinerary-detail-line">
                        <CalendarDays size={14} />
                        <span>{card.daysCount} Days</span>
                      </div>

                      <div className="itinerary-detail-line">
                        <span>
                          Total ₹
                          {card.totalEstimatedCost.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="itinerary-detail-line total">
                      <UserRound size={14} />
                      <span>
                        {card.adults} Adults {card.children} Children
                      </span>
                    </div>
                  </div>

                  <div className="itinerary-footer">
                    <Link href={`/result/${card.id}`} className="view-button">
                      {card.action} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {!loading && !cards.length ? (
            <div className="saved-empty itineraries-empty">
              <h3>No itineraries found</h3>
              <p>Try a different search, or generate your first trip plan.</p>
              <button
                className="premium-button"
                type="button"
                onClick={handleCreateTravelPlan}
              >
                <MapPin size={16} />
                <span>Create your first travel plan</span>
              </button>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
