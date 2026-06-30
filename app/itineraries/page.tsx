"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Compass,
  CreditCard,
  Grid2X2,
  Grid3X3,
  Heart,
  Home,
  LogIn,
  LogOut,
  Search,
  Settings,
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
    };
  };
};

type ItineraryPreview = {
  destination?: string;
  summary?: string;
  days?: { day?: string; title?: string }[];
  totalEstimatedCost?: number;
};

type UserInfo = { id: string; mobile: string; countryCode?: string } | null;

export default function ItineraryListPage() {
  const [user, setUser] = useState<UserInfo>(null);
  const [items, setItems] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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
    if (!term) {
      return items;
    }

    return items.filter((item) => {
      const itinerary = (item.output?.itinerary || item.output) as ItineraryPreview;
      return [
        itinerary.destination,
        itinerary.summary,
        new Date(item.createdAt).toLocaleDateString(),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [items, query]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <main className="saved-page scenic-shell">
      <aside className="saved-sidebar">
        <div className="brand-lockup">
          <img src="/tt_logo.png" alt="Travel Tuner" />
          <span>
            <Settings size={16} />
            AI-Powered Travel Planner
          </span>
        </div>

        <nav className="saved-nav">
          <Link href="/" className="saved-nav-item">
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          {user ? (
            <Link href="/itineraries" className="saved-nav-item active">
              <CalendarDays size={18} />
              <span>My Itineraries</span>
            </Link>
          ) : null}
          <Link href="/generate-itinerary" className="saved-nav-item">
            <Compass size={18} />
            <span>Explore Destinations</span>
          </Link>
          <Link href="/favorites" className="saved-nav-item">
            <Heart size={18} />
            <span>Favorites</span>
          </Link>
          <Link href="/payments" className="saved-nav-item">
            <CreditCard size={18} />
            <span>Payments</span>
          </Link>
          <Link href="/settings" className="saved-nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user ? (
            <button type="button" className="saved-nav-item" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" className="saved-nav-item">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </nav>

        <div className="upgrade-card">
          <h3>Plan smarter, travel better</h3>
          <p>Keep every trip in one place and open any itinerary in one tap.</p>
          <Link href="/generate-itinerary" className="primary-button wide">
            Create New Itinerary <ArrowRight size={16} />
          </Link>
        </div>

        <div className="sidebar-profile">
          <div className="avatar-circle">
            <UserRound size={18} />
          </div>
          <div>
            <strong>{user ? `+91 ${user.mobile}` : "Guest Traveler"}</strong>
            <span>{user ? "Mobile user" : "Saved itineraries"}</span>
          </div>
        </div>
      </aside>

      <section className="saved-stage">
        <header className="saved-hero">
          <div>
            <h1>Welcome back{user ? `, ${user.mobile}! 👋` : ""}</h1>
            <p>Here are your saved itineraries.</p>
          </div>

          <div className="saved-hero-actions">
            <button className="icon-pill" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <Link className="primary-button" href="/generate-itinerary">
              <span>+ New Itinerary</span>
            </Link>
          </div>
        </header>

        <section className="saved-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your itineraries..."
            />
          </label>

          <div className="toolbar-pills">
            <button type="button" className="chip-button active">All Trips</button>
            <button type="button" className="chip-button">Sort by: Recent</button>
            <button type="button" className="icon-pill" aria-label="Grid view">
              <Grid3X3 size={18} />
            </button>
            <button type="button" className="icon-pill" aria-label="Compact view">
              <Grid2X2 size={18} />
            </button>
          </div>
        </section>

        {loading ? <div className="saved-state">Loading itineraries...</div> : null}

        <section className="saved-grid">
          {filteredItems.map((item) => {
            const itinerary = (item.output?.itinerary || item.output) as ItineraryPreview;
            const firstDay = itinerary.days?.[0];

            return (
              <article className="trip-card" key={item.id}>
                <div className="trip-card-image" />
                <div className="trip-card-body">
                  <div className="trip-status-row">
                    <span className="status-pill">Saved</span>
                    <span className="trip-date">
                      <CalendarDays size={14} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2>{itinerary.destination || "Trip itinerary"}</h2>
                  <p>{itinerary.summary || "Saved itinerary ready to view."}</p>

                  <div className="trip-meta">
                    <span>{itinerary.days?.length || 0} Days</span>
                    <span>₹{Number(itinerary.totalEstimatedCost || 0).toLocaleString("en-IN")}</span>
                    <span>{firstDay?.title || firstDay?.day || "Details available"}</span>
                  </div>

                  <Link className="trip-view-button" href={`/result/${item.id}`}>
                    View Itinerary <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {!loading && !filteredItems.length ? (
          <div className="saved-empty">
            <h3>No itineraries found</h3>
            <p>Try a different search, or generate your first trip plan.</p>
            <Link className="primary-button" href="/generate-itinerary">
              Create your first itinerary
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
