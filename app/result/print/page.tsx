"use client";

import { useEffect, type ReactNode } from "react";
import {
  BedDouble,
  CalendarDays,
  CarFront,
  IndianRupee,
  MapPin,
  Soup,
  Train,
  UsersRound,
  Utensils,
  Clock3,
  Sparkles,
} from "lucide-react";
import { formatMoney, type LocalTransport, travelerTotal } from "../itinerary-data";
import { EmptyItinerary, useStoredItinerary } from "../ResultShell";

function PrintSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="pdf-section">
      <div className="pdf-section-head">
        <span className="pdf-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PrintPageHeader({ destination }: { destination?: string }) {
  return (
    <header className="pdf-header">
      <div className="pdf-header-brand">
        <img src="/tt_logo.png" alt="Travel Tuner" />
        <div>
          <strong>{destination || "Travel Plan"}</strong>
          <span>Complete itinerary summary</span>
        </div>
      </div>
      <div className="pdf-header-badge">
        <Sparkles size={15} />
        <span>Itinerary PDF</span>
      </div>
    </header>
  );
}

function PrintContent() {
  const { itinerary, ready } = useStoredItinerary();
  const isPremiumPlan = itinerary?.planId === "premium";

  useEffect(() => {
    if (!ready || !itinerary) {
      return;
    }

    const previousTitle = document.title;
    document.title = " ";

    const timer = window.setTimeout(() => {
      window.print();
    }, 350);

    return () => {
      window.clearTimeout(timer);
      document.title = previousTitle;
    };
  }, [ready, itinerary]);

  if (!ready) {
    return null;
  }

  if (!itinerary) {
    return <EmptyItinerary />;
  }

  if (!isPremiumPlan) {
    return (
      <main className="pdf-page">
        <div className="pdf-restricted">
          <PrintPageHeader destination={itinerary.destination} />
          <section className="pdf-restricted-card">
            <h1>PDF download is locked</h1>
            <p>Share and PDF export are available only on the Premium plan.</p>
          </section>
        </div>
      </main>
    );
  }

  const days = itinerary.days || [];
  const travelOptions = [
    ...(itinerary.travelOptions?.toDestination || []),
    ...(itinerary.travelOptions?.returnOptions || []),
  ];
  const localTransport = [
    ...(itinerary.travelOptions?.dayTransport || []),
    ...(itinerary.travelOptions?.localTransport || []),
  ];
  const stays = itinerary.stayOptions || [];
  const foodOptions = itinerary.foodOptions || [];

  return (
    <main className="pdf-page">
      <PrintPageHeader destination={itinerary.destination} />

      <section className="pdf-hero">
        <div className="pdf-hero-copy">
          <p className="pdf-kicker">Overview</p>
          <h1>{itinerary.destination || "Your Trip"}</h1>
          <p>{itinerary.summary}</p>
        </div>
        <div className="pdf-hero-stats">
          <div>
            <span>Days</span>
            <strong>{days.length}</strong>
          </div>
          <div>
            <span>Travelers</span>
            <strong>{travelerTotal(itinerary)}</strong>
          </div>
          <div>
            <span>Total Budget</span>
            <strong>{formatMoney(itinerary.totalEstimatedCost)}</strong>
          </div>
          <div>
            <span>Best Time</span>
            <strong>{itinerary.bestTimeToVisit || "Planned"}</strong>
          </div>
        </div>
      </section>

      <div className="pdf-grid">
        <PrintSection title="Traveler Information" icon={<UsersRound size={18} />}>
          <div className="pdf-facts">
            <div><span>Adults</span><strong>{itinerary.travelerInfo?.adults || 0}</strong></div>
            <div><span>Children</span><strong>{itinerary.travelerInfo?.children || 0}</strong></div>
            <div><span>Total Travelers</span><strong>{travelerTotal(itinerary)}</strong></div>
          </div>
        </PrintSection>

        <PrintSection title="Budget Breakdown" icon={<IndianRupee size={18} />}>
          <div className="pdf-facts">
            <div><span>Total</span><strong>{formatMoney(itinerary.totalEstimatedCost)}</strong></div>
            <div><span>Transport</span><strong>{formatMoney(itinerary.costBreakdown?.transport)}</strong></div>
            <div><span>Stay</span><strong>{formatMoney(itinerary.costBreakdown?.stay)}</strong></div>
            <div><span>Food</span><strong>{formatMoney(itinerary.costBreakdown?.food)}</strong></div>
            <div><span>Activities</span><strong>{formatMoney(itinerary.costBreakdown?.activities)}</strong></div>
          </div>
        </PrintSection>
      </div>

      <PrintSection title="Day-by-Day Itinerary" icon={<CalendarDays size={18} />}>
        <div className="pdf-day-list">
          {days.map((day, index) => (
            <article className="pdf-day-card" key={`${day.day}-${index}`}>
              <div className="pdf-day-head">
                <div>
                  <p className="pdf-kicker">{day.day || `Day ${index + 1}`}</p>
                  <h3>{day.title || "Planned Day"}</h3>
                </div>
                <strong>{formatMoney(day.estimatedDayCost)}</strong>
              </div>
              <p className="pdf-copy">
                {day.activities?.length
                  ? day.activities.join(". ")
                  : day.timeline?.map((item) => item.activity).join(". ")}
              </p>
              {day.timeline?.length ? (
                <div className="pdf-timeline">
                  {day.timeline.map((item, itemIndex) => (
                    <div className="pdf-timeline-row" key={`${item.time}-${itemIndex}`}>
                      <time>{item.time || `Slot ${itemIndex + 1}`}</time>
                      <span>{item.activity}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="pdf-tags">
                {day.food ? <span><Utensils size={13} /> Meal plan</span> : null}
                {day.stay ? <span><BedDouble size={13} /> Stay included</span> : null}
                {day.activities?.length ? <span><MapPin size={13} /> Activities</span> : null}
              </div>
            </article>
          ))}
        </div>
      </PrintSection>

      <div className="pdf-grid">
        <PrintSection title="Travel Options" icon={<Train size={18} />}>
          <div className="pdf-option-list">
            {travelOptions.length ? travelOptions.map((travel, index) => (
              <article className="pdf-option-card" key={`${travel.name}-${travel.number}-${index}`}>
                <div className="pdf-option-head">
                  <strong>{travel.name || travel.mode || "Travel"}</strong>
                  <b>{formatMoney(travel.cost)}</b>
                </div>
                <p className="pdf-copy">
                  {travel.from} to {travel.to}
                </p>
                <div className="pdf-tags">
                  <span><Clock3 size={13} /> {travel.departureTime || travel.duration || "Scheduled"}</span>
                  <span><CarFront size={13} /> {travel.class || "Standard"}</span>
                </div>
              </article>
            )) : <p className="pdf-empty">No travel options were provided.</p>}
          </div>
        </PrintSection>

        <PrintSection title="Local Transport" icon={<CarFront size={18} />}>
          <div className="pdf-option-list">
            {localTransport.length ? localTransport.map((option: LocalTransport, index) => (
              <article className="pdf-option-card" key={`${option.day}-${option.mode}-${index}`}>
                <div className="pdf-option-head">
                  <strong>{option.title || option.mode || "Local Transport"}</strong>
                  <b>{formatMoney(option.cost || option.dailyCost)}</b>
                </div>
                <p className="pdf-copy">{option.details || option.route || "Local transfers and sightseeing transport."}</p>
              </article>
            )) : <p className="pdf-empty">No local transport data was provided.</p>}
          </div>
        </PrintSection>
      </div>

      <div className="pdf-grid">
        <PrintSection title="Stay Options" icon={<BedDouble size={18} />}>
          <div className="pdf-option-list">
            {stays.length ? stays.map((stay, index) => (
              <article className="pdf-option-card" key={`${stay.name}-${index}`}>
                <div className="pdf-option-head">
                  <strong>{stay.name || "Stay option"}</strong>
                  <b>{formatMoney(stay.pricePerNight)}/night</b>
                </div>
                <p className="pdf-copy">
                  {stay.location || "Location not specified"} {stay.type ? `• ${stay.type}` : ""}
                </p>
                <div className="pdf-tags">
                  {stay.rating ? <span><Sparkles size={13} /> {stay.rating} rating</span> : null}
                  {stay.occupancy ? <span><UsersRound size={13} /> {stay.occupancy}</span> : null}
                </div>
              </article>
            )) : <p className="pdf-empty">No stay options were provided.</p>}
          </div>
        </PrintSection>

        <PrintSection title="Food & Tips" icon={<Soup size={18} />}>
          <div className="pdf-option-list">
            {days.some((day) => day.food || day.foodOptions?.length) || foodOptions.length ? (
              <>
                {days.map((day, index) => (
                  day.food || day.foodOptions?.length ? (
                    <article className="pdf-option-card" key={`food-${index}`}>
                      <div className="pdf-option-head">
                        <strong>{day.day || `Day ${index + 1}`} Meals</strong>
                      </div>
                      <p className="pdf-copy">
                        {day.food || day.foodOptions?.map((food) => [food.type, food.items?.join(", ")].filter(Boolean).join(": ")).join(". ")}
                      </p>
                    </article>
                  ) : null
                ))}
                {foodOptions.map((food, index) => (
                  <article className="pdf-option-card" key={`global-food-${index}`}>
                    <div className="pdf-option-head">
                      <strong>{food.day || `Meal Plan ${index + 1}`}</strong>
                      {food.cost ? <b>{formatMoney(food.cost)}</b> : null}
                    </div>
                    <p className="pdf-copy">{food.type ? `${food.type}: ` : ""}{food.items?.join(", ")}</p>
                  </article>
                ))}
              </>
            ) : (
              <p className="pdf-empty">No meal details were provided.</p>
            )}
          </div>
          <div className="pdf-tip-box">
            <strong>Tips</strong>
            <ul>
              {(itinerary.tips?.length ? itinerary.tips : ["Keep buffer time between activities."]).map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </PrintSection>
      </div>
    </main>
  );
}

export default function PrintItineraryPage() {
  return <PrintContent />;
}

