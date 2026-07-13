"use client";

import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Train,
  UsersRound,
  Utensils,
  Trophy,
} from "lucide-react";
import {
  dayTitle,
  formatMoney,
  readStoredItineraryContext,
  travelerTotal,
} from "./itinerary-data";
import { EmptyItinerary, ResultFrame, useStoredItinerary } from "./ResultShell";

export default function ResultPage({
  planId,
  itineraryId,
  initialItinerary,
}: {
  planId?: "silver" | "gold" | null;
  itineraryId?: string | null;
  initialItinerary?: any | null;
}) {
  const stored = useStoredItinerary();
  const itinerary = initialItinerary ?? stored.itinerary;
  const ready = initialItinerary ? true : stored.ready;

  if (!ready) {
    return null;
  }

  if (!itinerary) {
    return <EmptyItinerary />;
  }

  const days = itinerary.days || [];
  const arrivalOptions = itinerary.travelOptions?.toDestination || [];
  const departureOptions = itinerary.travelOptions?.returnOptions || [];
  const travelOptions = [...arrivalOptions, ...departureOptions];
  const stays = itinerary.stayOptions || [];
  const local = itinerary.travelOptions?.localTransport?.[0];
  const heroImage = itinerary.coverImageUrl || "/itinery_result.png";
  const resolvedPlanId = planId || itinerary?.planId || null;
  const resolvedItineraryId = itineraryId || null;

  return (
    <ResultFrame planId={resolvedPlanId} itineraryId={resolvedItineraryId}>
      <section className="result-hero">
        <div
          className={`result-plan-pill hero-badge ${resolvedPlanId === "gold" ? "is-gold" : "is-silver"}`}
        >
          <Trophy size={16} />
        </div>
        <img
          className="result-hero-image"
          src={heroImage}
          alt=""
          onError={(event) => {
            event.currentTarget.src = "/itinery_result.png";
          }}
        />
        <div className="result-hero-copy">
          <img src="/tt_logo.png" alt="Travel Tuner" />
          <h1>Itinerary Results</h1>
          <h2>{itinerary.destination || "Your Trip"}</h2>
          <p>
            {days.length} Days · {itinerary.travelerInfo?.adults || 0} Adults ·{" "}
            {itinerary.travelerInfo?.children || 0} Children
          </p>
        </div>
        {/* <div className="result-hero-badges">
          {[
            {
              title: "Smart Itineraries",
              text: "Curated just for you",
              Icon: Sparkles,
            },
            {
              title: "Real Time Data",
              text: "Stay updated always",
              Icon: Clock3,
            },
            {
              title: "Easy One-Plan",
              text: "All in one place",
              Icon: ShieldCheck,
            },
            {
              title: "Fully Customizable",
              text: "Your trip, your way",
              Icon: CheckCircle2,
            },
          ].map(({ title, text, Icon }) => {
            const BadgeIcon = Icon;
            return (
              <div className="hero-badge" key={title}>
                <BadgeIcon size={20} />
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            );
          })}
        </div> */}
      </section>

      {/* <Link className="review-strip" href={days[0] ? "/result/day/1" : "/result"}>
        <Sparkles size={22} />
        <div>
          <strong>Create trips that win the right plan.</strong>
          <span>Review your itinerary and get ready to explore.</span>
        </div>
        <ArrowRight size={20} />
      </Link> */}

      <div className="overview-grid">
        <section className="result-card summary-card">
          <div className="section-title-row">
            <span className="soft-icon rose">
              <MapPin size={20} />
            </span>
            <h2>Summary</h2>
          </div>
          <p>{itinerary.summary}</p>

          <div className="mini-grid result-metrics">
            <div className="mini-tile">
              <MapPin size={20} />
              <span>Destination</span>
              <strong>{itinerary.destination}</strong>
            </div>
            <div className="mini-tile">
              <CalendarDays size={20} />
              <span>Trip Length</span>
              <strong>{days.length} Days</strong>
            </div>
          </div>
        </section>

        <section className="result-card traveler-card">
          <div className="section-title-row">
            <span className="soft-icon green">
              <UsersRound size={20} />
            </span>
            <h2>Traveler Information</h2>
          </div>
          <p className="traveler-info-copy">
            {itinerary.travelerInfo?.adults || 0} Adults ·{" "}
            {itinerary.travelerInfo?.children || 0} Children
          </p>
          <div className="traveler-stats">
            <div>
              <UsersRound size={22} />
              <span>Travelers</span>
              <strong>{travelerTotal(itinerary)}</strong>
            </div>
            <div>
              <UsersRound size={22} />
              <span>Adults</span>
              <strong>{itinerary.travelerInfo?.adults || 0}</strong>
            </div>
            <div>
              <UsersRound size={22} />
              <span>Children</span>
              <strong>{itinerary.travelerInfo?.children || 0}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="result-card itinerary-overview">
          <div className="section-title-row">
            <span className="soft-icon blue">
              <CalendarDays size={20} />
            </span>
            <h2>Itinerary Overview</h2>
          </div>

          <div className="day-list">
            {days.map((day, index) => (
              <Link
                href={`/result/day/${index + 1}`}
                className="day-row"
                key={`${day.day}-${index}`}
              >
                <span className="day-calendar">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <strong>{dayTitle(day, index)}</strong>
                  <p>
                    {day.timeline?.[0]?.activity ||
                      day.activities?.[0] ||
                      "Detailed plan"}
                  </p>
                </div>
                <span className="day-chips">
                  {day.food ? <Utensils size={16} /> : null}
                  {day.stay ? <BedDouble size={16} /> : null}
                  {day.activities?.length ? <MapPin size={16} /> : null}
                </span>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </section>

        <div className="side-stack">
          <section className="result-card compact-card">
            <div className="section-title-row">
              <span className="soft-icon amber">
                <IndianRupee size={20} />
              </span>
              <h2>Budget Breakdown</h2>
            </div>
            <div className="budget-tiles">
              <div>
                <span>Total</span>
                <strong>{formatMoney(itinerary.totalEstimatedCost)}</strong>
              </div>
              <div>
                <span>Transport</span>
                <strong>
                  {formatMoney(itinerary.costBreakdown?.transport)}
                </strong>
              </div>
              <div>
                <span>Food</span>
                <strong>{formatMoney(itinerary.costBreakdown?.food)}</strong>
              </div>
              <div>
                <span>Activities</span>
                <strong>
                  {formatMoney(itinerary.costBreakdown?.activities)}
                </strong>
              </div>
            </div>
          </section>

          <section className="result-card compact-card">
            <div className="section-title-row">
              <span className="soft-icon red">
                <Train size={20} />
              </span>
              <h2>Travel Options</h2>
            </div>
            {travelOptions.slice(0, 3).map((travel, index) => (
              <div
                className="option-preview"
                key={`${travel.name}-${travel.number}-${index}`}
              >
                <div>
                  <strong>{travel.name}</strong>
                  <span>
                    {travel.from} to {travel.to}
                  </span>
                </div>
                <b>{formatMoney(travel.cost)}</b>
              </div>
            ))}
            <Link className="text-link" href="/result/travel">
              View All Options <ArrowRight size={16} />
            </Link>
          </section>

          {local ? (
            <section className="result-card compact-card">
              <div className="section-title-row">
                <span className="soft-icon green">
                  <CarFront size={20} />
                </span>
                <h2>Local Transport</h2>
              </div>
              <p className="muted-copy">{local.details}</p>
              <strong className="green-price">
                {formatMoney(local.dailyCost)} / day
              </strong>
            </section>
          ) : null}

          {stays.length ? (
            <section className="result-card compact-card">
              <div className="section-title-row">
                <span className="soft-icon blue">
                  <BedDouble size={20} />
                </span>
                <h2>Stay Options</h2>
              </div>
              {stays.slice(0, 2).map((stay) => (
                <div className="option-preview" key={stay.name}>
                  <div>
                    <strong>{stay.name}</strong>
                    <span>{stay.location}</span>
                  </div>
                  <b>{formatMoney(stay.pricePerNight)}/night</b>
                </div>
              ))}
              <Link className="text-link" href="/result/stays">
                View All Stays <ArrowRight size={16} />
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </ResultFrame>
  );
}
