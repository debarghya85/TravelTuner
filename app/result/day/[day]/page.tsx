"use client";

import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  MapPin,
  Soup,
} from "lucide-react";
import { useParams } from "next/navigation";
import { dayTitle, formatMoney } from "../../itinerary-data";
import { EmptyItinerary, ResultFrame, useStoredItinerary } from "../../ResultShell";

export default function DayDetailsPage() {
  const params = useParams<{ day: string }>();
  const { itinerary, ready } = useStoredItinerary();

  if (!ready) {
    return null;
  }

  if (!itinerary) {
    return <EmptyItinerary />;
  }

  const index = Math.max(0, Number(params.day || 1) - 1);
  const day = itinerary.days?.[index];

  if (!day) {
    return <EmptyItinerary />;
  }

  const detailCards = [
    {
      title: "Transport Details",
      text: "View all transport for this day",
      href: `/result/travel?day=${index + 1}`,
      icon: CarFront,
      color: "blue",
    },
    {
      title: "Stay Details",
      text: "View all stay options",
      href: `/result/stays?day=${index + 1}`,
      icon: BedDouble,
      color: "indigo",
    },
    {
      title: "Food Details",
      text: "View meal highlights",
      href: "#meals",
      icon: Soup,
      color: "red",
    },
    {
      title: "Activity Details",
      text: "View all activities",
      href: "#activities",
      icon: ClipboardList,
      color: "green",
    },
    {
      title: "Notes",
      text: "Important notes and tips",
      href: "#tips",
      icon: CheckCircle2,
      color: "rose",
    },
  ];
  const isFirstDay = index === 0;
  const isLastDay = Boolean(itinerary.days?.length && index === itinerary.days.length - 1);
  const arrivalTransport = itinerary.travelOptions?.toDestination?.[0];
  const departureTransport = itinerary.travelOptions?.returnOptions?.[0];
  const dayFoodOptions = day.foodOptions?.length
    ? day.foodOptions
    : itinerary.foodOptions?.filter((food) => {
        const foodDay = food.day?.toLowerCase() || "";
        return foodDay.includes(`day ${index + 1}`) || foodDay === String(index + 1);
      });
  const localTransportOptions = [
    ...(day.localTransport || []),
    ...(itinerary.travelOptions?.dayTransport || []),
    ...(itinerary.travelOptions?.localTransport || []),
  ];
  const dayLocalTransport = localTransportOptions.find((option) => {
    const transportDay = option.day?.toLowerCase() || "";
    return transportDay.includes(`day ${index + 1}`) || transportDay === String(index + 1);
  }) || itinerary.travelOptions?.localTransport?.[0];
  const dayStayOption = itinerary.stayOptions?.find((stay) => {
    const stayText = `${stay.name || ""} ${stay.location || ""}`.toLowerCase();
    return Boolean(day.stay && stayText.includes(day.stay.toLowerCase()));
  });
  const transportHighlights = [
    isFirstDay && arrivalTransport
      ? `Arrival: ${arrivalTransport.name || arrivalTransport.mode} (${arrivalTransport.arrivalTime || arrivalTransport.duration || "arrival"})`
      : "",
    dayLocalTransport
      ? `${dayLocalTransport.title || "Local"}: ${dayLocalTransport.details || dayLocalTransport.route || dayLocalTransport.mode}`
      : "",
    isLastDay && departureTransport
      ? `Departure: ${departureTransport.name || departureTransport.mode} (${departureTransport.departureTime || departureTransport.duration || "departure"})`
      : "",
  ].filter(Boolean);

  const aside = (
    <>
      <img className="day-aside-image" src="/itinery_result.png" alt="" />
      <div className="metrics-row">
        <div>
          <CarFront size={18} />
          <span>Transport</span>
          <strong>{dayLocalTransport?.duration || "Local"}</strong>
        </div>
        <div>
          <ClipboardList size={18} />
          <span>Activities</span>
          <strong>{day.activities?.length || 0}</strong>
        </div>
        <div>
          <Soup size={18} />
          <span>Meals</span>
          <strong>{dayFoodOptions?.length || (day.food ? 1 : 0)}</strong>
        </div>
        <div>
          <BedDouble size={18} />
          <span>Stay</span>
          <strong>{day.stay ? 1 : 0}</strong>
        </div>
      </div>

      {day.stay || itinerary.stayOptions?.[0] ? (
        <section className="aside-panel">
          <h3>Stay</h3>
          <div className="compact-stay">
            <div className="stay-image-placeholder">
              <BedDouble size={24} />
            </div>
            <div>
              <strong>{day.stay || dayStayOption?.name || itinerary.stayOptions?.[0]?.name}</strong>
              <span>{dayStayOption?.location || itinerary.stayOptions?.[0]?.location || "Planned stay"}</span>
              {dayStayOption?.pricePerNight || itinerary.stayOptions?.[0]?.pricePerNight ? (
                <b>{formatMoney(dayStayOption?.pricePerNight || itinerary.stayOptions?.[0]?.pricePerNight)}/night</b>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {transportHighlights.length ? (
        <section className="aside-panel">
          <h3>Transport</h3>
          <p>{transportHighlights.join(". ")}</p>
        </section>
      ) : null}

      {dayFoodOptions?.[0] || day.food ? (
        <section className="aside-panel" id="meals">
          <h3>Meal Highlights</h3>
          <p>
            {dayFoodOptions?.length
              ? dayFoodOptions
                  .map((food) => [food.type, food.items?.join(", ")].filter(Boolean).join(": "))
                  .join(". ")
              : day.food}
          </p>
        </section>
      ) : null}

      <Link className="outline-action" href="/result">
        Back to Itinerary
      </Link>
    </>
  );

  return (
    <ResultFrame
      title={dayTitle(day, index)}
      subtitle={day.title || "Daily plan"}
      backHref="/result"
      aside={aside}
    >
      <div className="day-detail-layout">
        <div className="day-cost-card day-cost-card-featured">
          <IndianRupee size={21} />
          <div>
            <strong>Estimated Day Cost</strong>
            <span>Included in your budget</span>
          </div>
          <b>{formatMoney(day.estimatedDayCost)}</b>
        </div>

        <div className="day-filter-row">
          <span>
            <MapPin size={16} />
            {itinerary.destination}
          </span>
          <span>
            <CalendarDays size={16} />
            Trip Day
          </span>
        </div>

        <section className="timeline-card">
          {day.timeline?.map((item, itemIndex) => (
            <div className="timeline-item" key={`${item.time}-${itemIndex}`}>
              <div className="timeline-rail">
                <span />
              </div>
              <time>{item.time}</time>
              <div>
                <strong>{item.activity}</strong>
                {itemIndex === 0 ? <small>Start your day with an easy pace</small> : null}
              </div>
            </div>
          ))}
        </section>

        <section className="result-card about-day">
          <h2>About the Day</h2>
          <p>
            {day.activities?.length
              ? day.activities.join(". ")
              : day.timeline?.map((item) => item.activity).join(". ")}
          </p>
        </section>

        <section className="detail-link-list">
          {detailCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link href={card.href} className="detail-link-card" key={card.title}>
                <span className={`soft-icon ${card.color}`}>
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{card.title}</strong>
                  <small>{card.text}</small>
                </div>
                <ArrowRight size={18} />
              </Link>
            );
          })}
        </section>

        <section className="tips-block" id="tips">
          <h2>Tips for the Day</h2>
          <ul>
            {(itinerary.tips?.length ? itinerary.tips : ["Keep buffer time between activities."]).slice(0, 4).map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      </div>
    </ResultFrame>
  );
}
