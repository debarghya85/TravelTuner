"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Filter,
  Heart,
  MapPin,
  Star,
  UsersRound,
  Wifi,
} from "lucide-react";
import { formatMoney } from "../itinerary-data";
import {
  EmptyItinerary,
  ResultFrame,
  useStoredItinerary,
} from "../ResultShell";

function getStayVisual(type?: string): { className: string; icon: string } {
  const normalizedType = type?.toLowerCase() || "";

  if (normalizedType.includes("resort")) {
    return { className: "stay-visual resort", icon: "🌴" };
  }

  if (normalizedType.includes("hostel")) {
    return { className: "stay-visual hostel", icon: "🛏️" };
  }

  if (normalizedType.includes("guest")) {
    return { className: "stay-visual guest-house", icon: "🏠🔑" };
  }

  if (normalizedType.includes("mid")) {
    return { className: "stay-visual mid-range", icon: "🏨" };
  }

  if (normalizedType.includes("budget")) {
    return { className: "stay-visual budget-hotel", icon: "🏨💵" };
  }

  return { className: "stay-visual hotel", icon: "🏨" };
}

function StayOptionsContent() {
  const { itinerary, ready } = useStoredItinerary();
  const searchParams = useSearchParams();

  if (!ready) {
    return null;
  }

  if (!itinerary) {
    return <EmptyItinerary />;
  }

  const stays = itinerary.stayOptions || [];
  const dayParam = searchParams.get("day");
  const selectedDay = dayParam ? Math.max(1, Number(dayParam)) : null;
  const selectedDayData = selectedDay ? itinerary.days?.[selectedDay - 1] : null;

  return (
    <ResultFrame
      title={selectedDay ? `Day ${selectedDay} Stay` : "Stay Options"}
      subtitle={
        selectedDay
          ? "Planned stay for this day and all available stay options"
          : "Handpicked stays for a comfortable experience"
      }
      backHref={selectedDay ? `/result/day/${selectedDay}` : "/result"}
    >
      <div className="stay-page-head">
        <div>
          <MapPin size={19} />
          <strong>{itinerary.destination}</strong>
        </div>
        {/* <button type="button">
          <Filter size={17} />
          Filters
        </button> */}
      </div>

      {selectedDayData?.stay ? (
        <section className="result-card compact-card">
          <div className="section-title-row">
            <span className="soft-icon indigo">
              <span aria-hidden="true">🏨</span>
            </span>
            <h2>Planned Stay</h2>
          </div>
          <p className="muted-copy">{selectedDayData.stay}</p>
        </section>
      ) : null}

      <div className="stay-list">
        {stays.map((stay, index) => {
          const stayVisual = getStayVisual(stay.type);

          return (
            <section className="stay-option-card" key={`${stay.name}-${index}`}>
              <div className={stayVisual.className}>
                <strong aria-hidden="true">{stayVisual.icon}</strong>
                <span>{stay.type || "Stay"}</span>
                {/* <button type="button" aria-label="Save stay">
                <Heart size={18} />
              </button> */}
              </div>

              <div className="stay-card-content">
                <div className="option-card-head">
                  <div>
                    <strong>{stay.name}</strong>
                    <span>
                      <MapPin size={15} />
                      {stay.location}
                    </span>
                  </div>
                  <b>{formatMoney(stay.pricePerNight)}/night</b>
                </div>

                <div className="stay-meta">
                  <span>
                    <Star size={16} />
                    {stay.rating || "4.2"} rating
                  </span>
                  <span>
                    <UsersRound size={16} />
                    {stay.occupancy ||
                      itinerary.travelerInfo?.pricingCalculatedFor}
                  </span>
                </div>

                <div className="pill-row">
                  {(stay.amenities?.length
                    ? stay.amenities
                    : ["Wi-Fi", "Breakfast", "Parking", "Hot Water"]
                  )
                    .slice(0, 4)
                    .map((amenity) => (
                      <span key={amenity}>
                        <Wifi size={15} />
                        {amenity}
                      </span>
                    ))}
                </div>

                <div className="stay-card-actions">
                  {stay.googleMapsLink ? (
                    <a
                      href={stay.googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Maps
                    </a>
                  ) : (
                    <span />
                  )}
                  {/* <button type="button">Select This Stay</button> */}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </ResultFrame>
  );
}

export default function StayOptionsPage() {
  return (
    <Suspense fallback={null}>
      <StayOptionsContent />
    </Suspense>
  );
}
