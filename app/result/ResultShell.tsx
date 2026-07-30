"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Crown,
  Download,
  Home,
  LockKeyhole,
  MapPin,
  Share2,
  Sparkles,
  ShieldCheck,
  X,
  UserRound,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Itinerary,
  readStoredItineraryContext,
  saveResolvedItinerary,
} from "./itinerary-data";
import { normalizePlanTier } from "../../lib/plan-names";
import { startItineraryUpgradeCheckout } from "../../lib/itinerary-upgrade-client";
import { setLoginReturnPath } from "../../lib/login-redirect";

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

      const resolveFromItineraryId = async (itineraryId: string) => {
        const response = await fetch(`/api/itineraries/${itineraryId}`);
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data?.itinerary
          ? {
              itinerary: data.itinerary as Itinerary,
              planId: normalizePlanTier(
                data?.planId || data?.itinerary?.planId || "silver",
              ),
              itineraryId,
            }
          : null;
      };

      const resolveFromJob = async (resolvedJobId: string) => {
        const response = await fetch(`/api/itinerary-jobs/${resolvedJobId}`);
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        const job = data?.job;
        const planId = normalizePlanTier(job?.input?.planId || "silver");
        return job?.output
          ? {
              ...job.output,
              planId,
            }
          : null;
      };

      if (stored?.itineraryId) {
        try {
          const resolvedById = await resolveFromItineraryId(stored.itineraryId);
          if (resolvedById) {
            setItinerary({
              ...resolvedById.itinerary,
              planId: resolvedById.planId,
            });
            saveResolvedItinerary(
              resolvedById.planId,
              {
                ...resolvedById.itinerary,
                planId: resolvedById.planId,
              },
              resolvedById.itineraryId,
            );
            setReady(true);
            return;
          }
        } catch (error) {
          console.error("[result] failed to load itinerary by id", error);
        }
      }

      if (jobId) {
        try {
          const resolvedItinerary = await resolveFromJob(jobId);
          if (resolvedItinerary) {
            setItinerary(resolvedItinerary);
            saveResolvedItinerary(
              normalizePlanTier(resolvedItinerary.planId || "silver"),
              resolvedItinerary,
              resolvedItinerary.itineraryId,
            );
            setReady(true);
            return;
          }
        } catch (error) {
          console.error("[result] failed to load itinerary from job", error);
        }
      }

      if (requestId) {
        try {
          const requestResponse = await fetch(
            `/api/itinerary-requests/${requestId}`,
          );
          if (requestResponse.ok) {
            const requestData = await requestResponse.json();
            const resolvedJob = requestData?.job;
            const planId = normalizePlanTier(
              requestData?.paymentOrder?.planId ||
                requestData?.request?.planId ||
                "silver",
            );
            const resolvedItinerary = resolvedJob?.output
              ? {
                  ...resolvedJob.output,
                  planId,
                }
              : null;

            if (resolvedItinerary) {
              setItinerary(resolvedItinerary);
              saveResolvedItinerary(
                planId,
                resolvedItinerary,
                resolvedJob?.output?.itineraryId,
              );
              setReady(true);
              return;
            }
          }
        } catch (error) {
          console.error(
            "[result] failed to load itinerary from request",
            error,
          );
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

export function ResultFrame({
  children,
  title,
  subtitle,
  backHref,
  aside,
  planId,
  itineraryId,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  aside?: React.ReactNode;
  planId?: "silver" | "gold" | null;
  itineraryId?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSilverUpgradePopover, setShowSilverUpgradePopover] =
    useState(true);
  const [user, setUser] = useState<UserInfo>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const consumedSilverPopoverRef = useRef(false);
  const storedContext = hasMounted ? readStoredItineraryContext() : null;
  const itinerary = storedContext?.itinerary || null;
  const resolvedItineraryId = itineraryId || storedContext?.itineraryId || null;
  const resolvedPlanId = normalizePlanTier(
    planId ?? storedContext?.planId ?? itinerary?.planId ?? "silver",
  );
  const isPremiumPlan = resolvedPlanId === "gold";
  const silverPopoverStorageKey = "travel-tuner:show-silver-upgrade-popover";

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();

    const handleViewportChange = () => syncViewport();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleViewportChange);
      } else {
        mediaQuery.removeListener(handleViewportChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobileViewport || isPremiumPlan) {
      return;
    }

    if (consumedSilverPopoverRef.current) {
      return;
    }

    consumedSilverPopoverRef.current = true;

    if (window.sessionStorage.getItem(silverPopoverStorageKey)) {
      setShowSilverUpgradePopover(true);
      window.sessionStorage.removeItem(silverPopoverStorageKey);
    }
  }, [isMobileViewport, isPremiumPlan]);

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

  const handleCreateTravelPlan = () => {
    if (user) {
      window.location.href = "/generate-itinerary";
      return;
    }

    setLoginReturnPath("/generate-itinerary");
    window.location.href = "/login";
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

  const upgradeToGold = async () => {
    if (!resolvedItineraryId) {
      alert(
        "We couldn't find this itinerary's ID. Please reopen the saved result and try again.",
      );
      return;
    }

    await startItineraryUpgradeCheckout({
      itineraryId: resolvedItineraryId,
      onVerified: async () => {
        try {
          const response = await fetch(
            `/api/itineraries/${resolvedItineraryId}`,
          );
          if (response.ok) {
            const data = await response.json();
            const updatedItinerary = data?.itinerary || null;
            const updatedPlanId = normalizePlanTier(
              data?.planId || updatedItinerary?.planId || "gold",
            );

            if (updatedItinerary) {
              saveResolvedItinerary(
                updatedPlanId,
                updatedItinerary,
                resolvedItineraryId,
              );
            }
          }
        } catch (error) {
          console.error("[result] failed to refresh upgraded itinerary", error);
        } finally {
          window.location.reload();
        }
      },
    });
  };

  return (
    <main className="result-app">
      <div className="result-mobile-shell">
        <header className="itineraries-mobile-header-result-details result-mobile-header">
          <button
            className="result-mobile-back"
            type="button"
            onClick={() => router.push(backHref || "/itineraries")}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
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

        {showSilverUpgradePopover && !isPremiumPlan ? (
          <div
            className="result-silver-popover"
            role="dialog"
            aria-label="Upgrade to Gold"
          >
            <button
              type="button"
              className="result-silver-popover-close"
              aria-label="Close upgrade popover"
              onClick={() => setShowSilverUpgradePopover(false)}
            >
              <X size={18} />
            </button>

            <div className="result-silver-popover-handle" aria-hidden="true" />

            <div className="result-silver-popover-hero">
              <span className="result-silver-popover-badge" aria-hidden="true">
                <Crown size={32} />
              </span>
              <div>
                <h2>Upgrade to Gold</h2>
                <h3>Unlock Share &amp; PDF Download!</h3>
              </div>
            </div>

            <div className="result-silver-popover-pricing">
              <div>
                <span>Gold Plan Price</span>
                <strong>₹49</strong>
              </div>
              <div>
                <span>Already paid for Silver Plan</span>
                <strong>₹9</strong>
              </div>
              <div className="result-silver-popover-total">
                <div>
                  <span>Now Pay Only</span>
                  <strong>₹35</strong>
                </div>
                <div className="result-silver-popover-save">
                  <span>You Save</span>
                  <strong>₹5</strong>
                </div>
              </div>
            </div>

            <div className="result-silver-popover-benefits">
              <div>
                <span className="result-silver-popover-icon whatsapp">
                  <MapPin size={18} />
                </span>
                <div>
                  <strong>Share your trip</strong>
                  <p>Share itinerary via WhatsApp or other apps</p>
                </div>
              </div>
              <div>
                <span className="result-silver-popover-icon pdf">
                  <Download size={18} />
                </span>
                <div>
                  <strong>Download as PDF</strong>
                  <p>Get a beautiful PDF itinerary anytime</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="result-silver-popover-cta"
              onClick={() => void upgradeToGold()}
            >
              <LockKeyhole size={18} />
              <span>Upgrade Now - ₹35</span>
            </button>

            <div className="result-silver-popover-footer">
              <span>
                <ShieldCheck size={14} />
                Secure Payment
              </span>
              <span>•</span>
              <span>Instant Access</span>
            </div>
            <div className="result-silver-popover-footer">
              <Link
                href="#"
                className="result-silver-popover-later"
                onClick={(event) => {
                  event.preventDefault();
                  setShowSilverUpgradePopover(false);
                }}
              >
                Maybe Later
              </Link>
            </div>
          </div>
        ) : null}

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-share2 lucide-share-2"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                </svg>
                Share on WhatsApp
              </button>
              <button
                className="pdf-action"
                type="button"
                onClick={downloadPdf}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-download"
                  aria-hidden="true"
                >
                  <path d="M12 15V3"></path>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <path d="m7 10 5 5 5-5"></path>
                </svg>
                Download as PDF
              </button>
            </>
          ) : (
            <div className="result-silver-upgrade-card">
              <div className="result-silver-upgrade-head">
                <span
                  className="result-silver-upgrade-badge"
                  aria-hidden="true"
                >
                  <Crown size={22} />
                </span>
                <div>
                  <strong>Upgrade to Gold</strong>
                  <p>Share your itinerary and download it as a PDF.</p>
                </div>
              </div>

              <div className="result-silver-upgrade-price">
                <div>
                  <span>Gold Plan Price</span>
                  <strong>₹49</strong>
                </div>
                <div>
                  <span>Already paid for Silver Plan</span>
                  <strong>₹9</strong>
                </div>
              </div>

              <div className="result-silver-upgrade-total">
                <div>
                  <span>Pay Only</span>
                  <strong>₹35</strong>
                </div>
                <div className="result-silver-upgrade-save">
                  <span>You Save</span>
                  <strong>₹5</strong>
                </div>
              </div>

              <ul
                className="result-silver-upgrade-points"
                aria-label="Included benefits"
              >
                <li>
                  <ShieldCheck size={16} />
                  Secure payment
                </li>
                <li>
                  <Sparkles size={16} />
                  Instant access
                </li>
              </ul>

              <button
                type="button"
                className="result-silver-upgrade-cta"
                onClick={() => void upgradeToGold()}
              >
                <LockKeyhole size={16} />
                <span>Unlock Gold • ₹35</span>
              </button>
            </div>
          )}
          {/* <div className="premium-card">
            <div className="premium-card-art">
              <img src="/itinerary_leftpanel.png" alt="" />
            </div>
            <div className="premium-card-copy">
              <h3>
                Plan smarter,
                <span className="gradient-travel-text">travel better</span>
              </h3>
              <p>
                Let our AI craft the perfect itinerary for your next adventure.
              </p>
            </div>

            <button className="plan-trip-btn" onClick={handleCreateTravelPlan}>
              <MapPin size={16} strokeWidth={2.4} />
              Plan Another Trip
            </button>
          </div> */}
          <button className="plan-trip-btn" onClick={handleCreateTravelPlan}>
            <MapPin size={16} strokeWidth={2.4} />
            Plan Another Trip
          </button>
        </div>
      </aside>

      <section
        className={`result-stage ${isPremiumPlan ? "is-premium" : "is-silver"}`}
      >
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

        <div
          className={`result-mobile-actions ${isPremiumPlan ? "is-premium" : "is-silver"}`}
        >
          {isPremiumPlan ? (
            <>
              <button
                className="whatsapp-action"
                type="button"
                onClick={shareOnWhatsApp}
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
              <button
                className="pdf-action"
                type="button"
                onClick={downloadPdf}
              >
                <Download size={18} />
                <span>Download</span>
              </button>
              <Link href="/generate-itinerary" className="primary-action">
                <MapPin size={18} />
                <span>Plan Trip</span>
              </Link>
            </>
          ) : (
            <div className="result-mobile-upgrade-grid">
              <div className="result-upgrade-card gold">
                <div className="result-upgrade-card-head">
                  <span className="result-upgrade-icon gold" aria-hidden="true">
                    <Crown size={28} />
                  </span>
                  <div>
                    <strong>Gold Plan</strong>
                    <p>Unlock Share &amp; Download PDF</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="result-upgrade-cta gold"
                  onClick={() => void upgradeToGold()}
                >
                  <span>Upgrade • ₹35</span>
                </button>
              </div>

              <div className="result-upgrade-card blue">
                <div className="result-upgrade-card-head">
                  <span className="result-upgrade-icon blue" aria-hidden="true">
                    <MapPin size={28} />
                  </span>
                  <div>
                    <strong>Plan Trip</strong>
                    <p>Customize your itinerary</p>
                  </div>
                </div>
                <Link
                  href="/generate-itinerary"
                  className="result-upgrade-cta blue"
                >
                  <span>Plan Trip</span>
                </Link>
              </div>
            </div>
          )}
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
