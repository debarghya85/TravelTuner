"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  Home,
  MapPin,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Itinerary, readItinerary } from "./itinerary-data";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/result", label: "Itinerary", icon: CalendarDays },
  { href: "/itineraries", label: "My Travel Plans", icon: CalendarDays },
  // { href: "/result/stays", label: "Saved", icon: Heart },
  // { href: "/result/travel", label: "Bookings", icon: BriefcaseBusiness },
  // { href: "/", label: "Profile", icon: UserRound },
];

export function useStoredItinerary() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItinerary(readItinerary());
    setReady(true);
  }, []);

  return { itinerary, ready };
}

export function ResultFrame({
  children,
  title,
  subtitle,
  backHref,
  aside,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  aside?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const shareOnWhatsApp = () => {
    const itinerary = readItinerary();

    if (!itinerary) {
      return;
    }

    const dayLines = itinerary.days
      ?.map(
        (day, index) =>
          `${day.day || `Day ${index + 1}`}: ${day.title || "Planned day"}`,
      )
      .join("\n");

    const message = [
      "Travel Tuner Itinerary",
      "",
      `Destination: ${itinerary.destination || "Your trip"}`,
      `Budget: ${itinerary.totalEstimatedCost ? `₹${itinerary.totalEstimatedCost.toLocaleString("en-IN")}` : "Planned"}`,
      "",
      itinerary.summary || "",
      "",
      dayLines || "",
    ].join("\n");

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const downloadPdf = () => {
    const itinerary = readItinerary();

    if (!itinerary) {
      return;
    }

    window.open("/result/print", "_blank", "noopener,noreferrer");
  };

  return (
    <main className="result-app">
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

        <div className="result-mobile-actions">
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
        </div>

        <div className={aside ? "result-content-with-aside" : "result-content"}>
          <div>{children}</div>
          {aside ? (
            <aside className="result-detail-aside">{aside}</aside>
          ) : null}
        </div>
      </section>

      <nav className="mobile-tabbar" aria-label="Mobile result navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.label === "Itinerary"
              ? pathname.startsWith("/result")
              : pathname === item.href;

          return (
            <Link
              href={item.href}
              className={active ? "active" : ""}
              key={item.label}
              aria-label={item.label}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
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
