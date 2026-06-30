"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Heart,
  Home,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";

type ItineraryRecord = {
  id: string;
  createdAt: string;
  output: {
    itinerary?: {
      destination?: string;
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
  summary?: string;
  days?: { day?: string; title?: string }[];
  totalEstimatedCost?: number;
  travelerInfo?: {
    adults?: number;
    children?: number;
    pricingCalculatedFor?: string;
  };
};

type UserInfo = { id: string; mobile: string; countryCode?: string } | null;

type CardData = {
  id: string;
  image: string;
  status: "Saved" | "Completed" | "Draft";
  title: string;
  subtitle: string;
  daysCount: number;
  adults: number;
  children: number;
  totalEstimatedCost: number;
  date: string;
  action: "View Itinerary" | "Continue Planning";
  tone: "saved" | "completed" | "draft";
};

export default function ItineraryListPage() {
  const [user, setUser] = useState<UserInfo>(null);
  const [items, setItems] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

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
        const status: CardData["status"] =
          index % 3 === 1 ? "Completed" : index % 3 === 2 ? "Draft" : "Saved";

        return {
          id: item.id,
          image: "/itinery_result.png",
          status,
          title: itinerary.destination || "Trip itinerary",
          subtitle:
            itinerary.summary ||
            itinerary.travelerInfo?.pricingCalculatedFor ||
            "Saved itinerary",
          daysCount,
          adults,
          children,
          totalEstimatedCost,
          date: new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          action: "View Itinerary",
          tone:
            status === "Completed"
              ? "completed"
              : status === "Draft"
                ? "draft"
                : "saved",
        };
      }),
    [filteredItems],
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <main className="itineraries-shell scenic-shell">
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
            <span>Dashboard</span>
          </Link>
          <Link href="/itineraries" className="itineraries-nav-item active">
            <CalendarDays size={18} />
            <span>My Itineraries</span>
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
          <Link href="/generate-itinerary" className="premium-button">
            Create New <ArrowRight size={16} />
          </Link>
          <img src="/form_bg.jpg" alt="" />
        </div>

        <button
          type="button"
          className="sidebar-phone"
          onClick={() => setAccountOpen((v) => !v)}
        >
          <div>
            <Smartphone size={18} />
            <span>
              <strong>{user ? `+91 ${user.mobile}` : "+91 89108 82091"}</strong>
              <small>{user ? "Verified via OTP" : "Verified via OTP"}</small>
            </span>
          </div>
          <ChevronRight size={20} />
        </button>
      </aside>

      <section className="itineraries-stage">
        <header className="itineraries-header">
          <div className="itineraries-title">
            <CalendarDays size={36} />
            <div>
              <h1>My Itineraries</h1>
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
                <Smartphone size={18} />
              </span>
              <span className="account-pill-text">+91 89108 82091</span>
              <ChevronDown size={18} />
            </button>

            {accountOpen ? (
              <div className="account-menu">
                <p>Signed in with</p>
                <strong>+91 89108 82091</strong>
                <span className="verified-row">
                  <Smartphone size={16} />
                  Verified via OTP
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
                  <img src={card.image} alt="" />
                  <button
                    type="button"
                    className="heart-button"
                    aria-label="Save itinerary"
                  >
                    <Heart size={18} />
                  </button>
                  <span className={`status-pill status-${card.tone}`}>
                    {card.status}
                  </span>
                </div>

                <div className="itinerary-card-body">
                  <h2>{card.title}</h2>
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
              <Link className="premium-button" href="/generate-itinerary">
                Create your first itinerary
              </Link>
            </div>
          ) : null}

          <section className="itineraries-banner">
            <div className="banner-copy">
              <Sparkles size={34} />
              <div>
                <h3>Plan smarter, travel better</h3>
                <p>
                  Let our AI craft the perfect itinerary for your next
                  adventure.
                </p>
              </div>
            </div>
            <div className="banner-doodle" aria-hidden="true" />
            <Link href="/generate-itinerary" className="banner-button">
              Create New Itinerary <ArrowRight size={18} />
            </Link>
          </section>
        </section>
      </section>
    </main>
  );
}
