"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Home,
  MapPin,
  Share2,
  Download,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Itinerary, readStoredItineraryContext } from "./itinerary-data";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/result", label: "Itinerary", icon: CalendarDays },
  { href: "/itineraries", label: "My Travel Plans", icon: CalendarDays },
  // { href: "/result/stays", label: "Saved", icon: Heart },
  // { href: "/result/travel", label: "Bookings", icon: BriefcaseBusiness },
  // { href: "/", label: "Profile", icon: UserRound },
];

type UserInfo = {
  id: string;
  provider: "google" | "facebook" | "email" | "unknown";
  providerId: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
} | null;

export function useStoredItinerary() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = readStoredItineraryContext();
      const jobId =
        window.sessionStorage.getItem("travel-tuner:last-job-id") ||
        window.localStorage.getItem("travel-tuner:last-job-id");
      const requestId =
        window.sessionStorage.getItem("travel-tuner:last-request-id") ||
        window.localStorage.getItem("travel-tuner:last-request-id");

      const resolveFromJob = async (resolvedJobId: string) => {
        const response = await fetch(`/api/itinerary-jobs/${resolvedJobId}`);
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        const job = data?.job;
        const planId = (job?.input?.planId || "view-only") as "view-only" | "premium";
        return job?.output
          ? {
              ...job.output,
              planId,
            }
          : null;
      };

      if (jobId) {
        try {
          const resolvedItinerary = await resolveFromJob(jobId);
          if (resolvedItinerary) {
            setItinerary(resolvedItinerary);
            saveResolvedItinerary((resolvedItinerary.planId || "view-only") as "view-only" | "premium", resolvedItinerary);
            setReady(true);
            return;
          }
        } catch (error) {
          console.error("[result] failed to load itinerary from job", error);
        }
      }

      if (requestId) {
        try {
          const requestResponse = await fetch(`/api/itinerary-requests/${requestId}`);
          if (requestResponse.ok) {
            const requestData = await requestResponse.json();
            const resolvedJob = requestData?.job;
            const planId = (requestData?.paymentOrder?.planId || requestData?.request?.planId || "view-only") as "view-only" | "premium";
            const resolvedItinerary = resolvedJob?.output
              ? {
                  ...resolvedJob.output,
                  planId,
                }
              : null;

            if (resolvedItinerary) {
              setItinerary(resolvedItinerary);
              saveResolvedItinerary(planId, resolvedItinerary);
              setReady(true);
              return;
            }
          }
        } catch (error) {
          console.error("[result] failed to load itinerary from request", error);
        }
      }

      if (!jobId && stored?.itinerary) {
        setItinerary(stored.itinerary);
        setReady(true);
        return;
      }

      setItinerary(stored?.itinerary || null);
      setReady(true);
    };

    void load();
  }, []);

  return { itinerary, ready };
}

function saveResolvedItinerary(planId: "view-only" | "premium", itinerary: Itinerary) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({
    success: true,
    planId,
    itinerary,
    savedAt: Date.now(),
  });

  window.sessionStorage.setItem("travel-tuner:last-itinerary", payload);
  window.localStorage.setItem("travel-tuner:last-itinerary:local", payload);
}

export function ResultFrame({
  children,
  title,
  subtitle,
  backHref,
  aside,
  planId,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  aside?: React.ReactNode;
  planId?: "view-only" | "premium" | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo>(null);
  const storedContext = readStoredItineraryContext();
  const itinerary = storedContext?.itinerary || null;
  const isPremiumPlan = (planId || storedContext?.planId) === "premium";

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    };

    loadUser();
  }, []);

  const shareOnWhatsApp = () => {
    if (!itinerary) return;
    if (!isPremiumPlan) return;

    const formatMoney = (amount?: number) =>
      amount ? `₹${amount.toLocaleString("en-IN")}` : "N/A";

    const route = `${itinerary.travelOptions?.toDestination[0]?.from} ➜ ${itinerary.destination}`;

    const travelSection = [
      "-------------------------",
      "✈️ *Travel Options*",
      "-------------------------",
      "➡️ *To Destination*",
      ...(itinerary.travelOptions?.toDestination || []).map(
        (t: any) =>
          `${t.mode === "flight" ? "✈️" : "🚆"} ${t.provider} ${t.number}
            ${t.from} → ${t.to}
            🕒 ${t.departureTime} - ${t.arrivalTime}
            💺 ${t.class}
            💰 ${formatMoney(t.cost)}`,
      ),
      "",
      "⬅️ *Return Journey*",
      ...(itinerary.travelOptions?.returnOptions || []).map(
        (t: any) =>
          `${t.mode === "flight" ? "✈️" : "🚆"} ${t.provider} ${t.number}
              ${t.from} → ${t.to}
              🕒 ${t.departureTime} - ${t.arrivalTime}
              💺 ${t.class}
              💰 ${formatMoney(t.cost)}`,
      ),
    ].join("\n");

    const hotelSection = [
      "-------------------------",
      "🏨 *Hotel & Stay*",
      "-------------------------",
      ...(itinerary.stayOptions || []).map(
        (hotel: any) =>
          `🏨 *${hotel.name}*
            📍 ${hotel.location}
            ⭐ ${hotel.rating}
            🛏️ ${hotel.roomCategory}
            💵 ${formatMoney(hotel.pricePerNight)}/night`,
      ),
    ].join("\n");

    const foodSection = [
      "-------------------------",
      "🍽️ *Food Options*",
      "-------------------------",
      ...(itinerary.foodOptions || []).map(
        (food: any) =>
          `📅 ${food.day}
            🍴 ${food.items.join(", ")}
            💰 ${formatMoney(food.cost)}`,
      ),
    ].join("\n");

    const daySection = [
      "----------------------------",
      "🗓️ *Day Wise Plan*",
      "----------------------------",
      ...(itinerary.days || []).map((day: any) => {
        const timeline =
          day.timeline
            ?.map((t: any) => `🕒 ${t.time}\n${t.activity}`)
            .join("\n") || "";

        const activities =
          day.activities?.map((a: string) => `• ${a}`).join("\n") || "";

        return `
📅 *${day.day}*
         
🏔️ ${day.title}

${timeline}

🎯 Activities
${activities}

🍽️ Food to Try
${day.food}

🏨 Stay
${day.stay}

💰 Estimated Cost
${formatMoney(day.estimatedDayCost)}\n\n`;
      }),
    ].join("\n");

    const message = [
      "🌍 *Travel Tuner Itinerary*",
      "-------------------------",
      "📍 *Route*",
      route,
      "",
      "💰 *Estimated Trip Cost*",
      formatMoney(itinerary.totalEstimatedCost),
      "",
      itinerary.summary,
      "",
      travelSection,
      "",
      hotelSection,
      "",
      foodSection,
      "",
      daySection,
      "",
      "❤️ Generated using Travel Tuner ❤️",
    ].join("\n");

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const downloadPdf = () => {
    if (!itinerary) {
      return;
    }

    if (!isPremiumPlan) {
      return;
    }

    window.open("/result/print", "_blank", "noopener,noreferrer");
  };

  return (
    <main className="result-app">
      <div className="result-mobile-shell">
        <header className="itineraries-mobile-header1 result-mobile-header">
          <button
            className="result-mobile-back"
            type="button"
            onClick={() => router.push(backHref || "/itineraries")}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

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
            aria-controls="result-mobile-menu"
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
              id="result-mobile-menu"
              role="menu"
            >
              <div className="landing-mobile-menu-user-card">
                <span className="landing-mobile-menu-user-avatar">
                  <img
                    src={user?.photoURL || "/default-avatar.svg"}
                    alt={user?.displayName || "User"}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallbackApplied === "1") return;
                      target.dataset.fallbackApplied = "1";
                      target.src = "/default-avatar.svg";
                    }}
                  />
                </span>
                <div>
                  <strong>{user?.displayName || user?.email || "Traveler"}</strong>
                  <p>
                    {user?.provider === "unknown"
                      ? "Logged in"
                      : `Logged in with ${user?.provider || "account"}`}
                  </p>
                </div>
              </div>
              <div className="landing-mobile-menu-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.label === "Itinerary"
                      ? pathname.startsWith("/result")
                      : pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`landing-mobile-menu-link ${active ? "active" : ""}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="landing-mobile-menu-item-icon">
                        <Icon size={18} />
                      </span>
                      <strong>{item.label}</strong>
                      <span className="landing-mobile-menu-link-arrow">›</span>
                    </Link>
                  );
                })}
              </div>
              <button
                type="button"
                className="landing-mobile-menu-logout"
                onClick={handleLogout}
              >
                <span className="landing-mobile-menu-item-icon">
                  <UserRound size={18} />
                </span>
                <strong>Logout</strong>
              </button>
            </div>
          </>
        ) : null}
      </div>

      <aside className="result-sidebar">
        <Link href="/" className="result-logo">
          <img src="/tt_logo.png" alt="Travel Tuner" />
        </Link>

        <nav aria-label="Result navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.label === "Itinerary"
                ? pathname.startsWith("/result")
                : pathname === item.href;

            return (
              <Link
                className={`result-nav-item ${active ? "active" : ""}`}
                href={item.href}
                key={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="result-sidebar-actions">
          {isPremiumPlan ? (
            <>
              <button
                className="whatsapp-action"
                type="button"
                onClick={shareOnWhatsApp}
              >
                Share on WhatsApp
              </button>
              <button className="pdf-action" type="button" onClick={downloadPdf}>
                Download as PDF
              </button>
            </>
          ) : (
            <div className="result-plan-lock">
              <strong>View only plan</strong>
              <span>Share and PDF download are available in Premium.</span>
            </div>
          )}
          <Link href="/generate-itinerary" className="primary-action">
            Plan Another Trip
          </Link>
        </div>
      </aside>

      <section className="result-stage">
        {(title || backHref) && (
          <header className="result-topbar">
            {backHref ? (
              <button
                className="icon-button"
                type="button"
                onClick={() => router.push(backHref)}
                aria-label="Go back"
              >
                <ArrowLeft size={21} />
              </button>
            ) : (
              <span />
            )}

            <div>
              {title ? <h1>{title}</h1> : null}
              {subtitle ? <p>{subtitle}</p> : null}
            </div>

            {/* <button
              className="icon-button"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button> */}
          </header>
        )}

        <div className={aside ? "result-content-with-aside" : "result-content"}>
          <div>{children}</div>
          {aside ? (
            <aside className="result-detail-aside">{aside}</aside>
          ) : null}
        </div>

        <div className="result-mobile-actions">
          {isPremiumPlan ? (
            <>
              <button
                className="whatsapp-action"
                type="button"
                onClick={shareOnWhatsApp}
              >
                <Share2 size={18} />
                <span>Share on WhatsApp</span>
              </button>
              <button className="pdf-action" type="button" onClick={downloadPdf}>
                <Download size={18} />
                <span>Download as PDF</span>
              </button>
            </>
          ) : (
            <div className="result-plan-lock mobile">
              <strong>View only plan</strong>
              <span>Share and PDF download are available in Premium.</span>
            </div>
          )}
          <Link href="/generate-itinerary" className="primary-action">
            <BriefcaseBusiness size={18} />
            Plan Another Trip
          </Link>
        </div>
      </section>
    </main>
  );
}

export function EmptyItinerary() {
  return (
    <ResultFrame>
      <div className="empty-itinerary">
        <MapPin size={34} />
        <h1>No itinerary found</h1>
        <p>Generate a fresh trip plan to see your results here.</p>
        <Link href="/generate-itinerary" className="primary-action">
          Generate Itinerary
        </Link>
      </div>
    </ResultFrame>
  );
}
