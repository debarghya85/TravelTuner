"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CarFront, Clock3, Info, Route, Train } from "lucide-react";
import { formatMoney, type LocalTransport, type TravelOption } from "../itinerary-data";
import {
  EmptyItinerary,
  ResultFrame,
  useStoredItinerary,
} from "../ResultShell";
import { matchesDayLabel, uniqueLocalTransport } from "../itinerary-data";

function TravelOptionCard({
  option,
  index,
  label,
}: {
  option: TravelOption;
  index: number;
  label: string;
}) {
  return (
    <section
      className="travel-option-card"
      key={`${label}-${option.name}-${option.number}-${index}`}
    >
      <div className="option-card-head">
        <div>
          <span className="train-badge">
            {label} {option.mode || "TRAVEL"} {option.number || index + 1}
          </span>
          <strong>{option.name}</strong>
        </div>
        <b>{formatMoney(option.cost)}</b>
      </div>

      <div className="route-grid">
        <div>
          <strong>{option.departureTime}</strong>
          <span>{option.from}</span>
        </div>
        <ArrowRight size={20} />
        <div>
          <strong>{option.arrivalTime}</strong>
          <span>{option.to}</span>
        </div>
      </div>

      <div className="pill-row">
        <span>
          <Train size={16} />
          {option.class || "Standard"}
        </span>
        <span>
          <Clock3 size={16} />
          {option.duration || "Duration varies"}
        </span>
        <span>
          <Route size={16} />
          {option.frequency || "Check availability"}
        </span>
      </div>

      <div className="option-foot">
        <p>{option.notes || "Timings and fares may vary by season."}</p>
      </div>
    </section>
  );
}

function LocalTransportCard({
  option,
  index,
}: {
  option: LocalTransport;
  index: number;
}) {
  return (
    <section className="travel-option-card" key={`${option.day}-${option.mode}-${index}`}>
      <div className="option-card-head">
        <div>
          <span className="train-badge">LOCAL {option.day || index + 1}</span>
          <strong>{option.title || option.mode || "Local Transport"}</strong>
        </div>
        <b>{formatMoney(option.cost || option.dailyCost)}</b>
      </div>

      <div className="pill-row">
        <span>
          <CarFront size={16} />
          {option.mode || "Cab / local transport"}
        </span>
        {option.duration ? (
          <span>
            <Clock3 size={16} />
            {option.duration}
          </span>
        ) : null}
        {option.route ? (
          <span>
            <Route size={16} />
            {option.route}
          </span>
        ) : null}
      </div>

      <div className="option-foot">
        <p>{option.details || "Local transfers and sightseeing transport."}</p>
      </div>
    </section>
  );
}

function TravelOptionsContent() {
  const { itinerary, ready } = useStoredItinerary();
  const searchParams = useSearchParams();

  if (!ready) {
    return null;
  }

  if (!itinerary) {
    return <EmptyItinerary />;
  }

  const dayParam = searchParams.get("day");
  const selectedDay = dayParam ? Math.max(1, Number(dayParam)) : null;
  const selectedDayData = selectedDay ? itinerary.days?.[selectedDay - 1] : null;
  const isFirstDay = selectedDay === 1;
  const isLastDay = Boolean(selectedDay && itinerary.days?.length === selectedDay);
  const arrivalOptions = itinerary.travelOptions?.toDestination || [];
  const departureOptions = itinerary.travelOptions?.returnOptions || [];
  const allLocalOptions = [
    ...((selectedDayData?.localTransport || []) as LocalTransport[]),
    ...(itinerary.travelOptions?.dayTransport || []),
    ...(itinerary.travelOptions?.localTransport || []),
  ];
  const dayLocalOptions = selectedDay
    ? uniqueLocalTransport(
        allLocalOptions.filter((option) => matchesDayLabel(option.day, selectedDay)),
      )
    : [];
  const displayedLocalOptions = selectedDay
    ? dayLocalOptions.length
      ? dayLocalOptions
      : selectedDayData?.localTransport?.length
        ? uniqueLocalTransport(selectedDayData.localTransport)
        : uniqueLocalTransport(itinerary.travelOptions?.localTransport || [])
    : allLocalOptions;
  const title = selectedDay ? `Day ${selectedDay} Transport` : "Travel Options";
  const subtitle = selectedDay
    ? "Local transfers and sightseeing transport for this day"
    : `Arrival, departure and local travel for ${itinerary.destination || "your destination"}`;

  return (
    <ResultFrame
      title={title}
      subtitle={subtitle}
      backHref={selectedDay ? `/result/day/${selectedDay}` : "/result"}
    >
      <div className="option-page-list">
        {!selectedDay ? (
          <>
            {arrivalOptions.length ? <h2 className="option-group-title">Arrival Options</h2> : null}
            {arrivalOptions.map((option, index) => (
              <TravelOptionCard option={option} index={index} label="ARRIVAL" key={`arrival-${index}`} />
            ))}

            {departureOptions.length ? <h2 className="option-group-title">Departure Options</h2> : null}
            {departureOptions.map((option, index) => (
              <TravelOptionCard option={option} index={index} label="DEPARTURE" key={`departure-${index}`} />
            ))}
          </>
        ) : null}

        {selectedDay && isFirstDay && arrivalOptions.length ? (
          <>
            <h2 className="option-group-title">Arrival Transport</h2>
            {arrivalOptions.map((option, index) => (
              <TravelOptionCard option={option} index={index} label="ARRIVAL" key={`arrival-${index}`} />
            ))}
          </>
        ) : null}

        {displayedLocalOptions.length ? (
          <h2 className="option-group-title">
            {selectedDay ? `Day ${selectedDay} Local Transport` : "Local Transport"}
          </h2>
        ) : null}
        {displayedLocalOptions.map((option, index) => (
          <LocalTransportCard option={option} index={index} key={`local-${index}`} />
        ))}

        {selectedDay && !displayedLocalOptions.length ? (
          <section className="travel-option-card">
            <div className="option-card-head">
              <div>
                <span className="train-badge">LOCAL</span>
                <strong>Local Transport</strong>
              </div>
            </div>
            <div className="option-foot">
              <p>Local transport for this day was not provided in the itinerary data.</p>
            </div>
          </section>
        ) : null}

        {selectedDay && isLastDay && departureOptions.length ? (
          <>
            <h2 className="option-group-title">Departure Transport</h2>
            {departureOptions.map((option, index) => (
              <TravelOptionCard option={option} index={index} label="DEPARTURE" key={`departure-${index}`} />
            ))}
          </>
        ) : null}

        <div className="info-note">
          <Info size={18} />
          <p>
            Seat availability, fares, and local transfer costs can change.
            Please check the operator before booking.
          </p>
        </div>

        <Link className="outline-action" href={selectedDay ? `/result/day/${selectedDay}` : "/result"}>
          {selectedDay ? "Back to Day Plan" : "Back to Itinerary"}
        </Link>
      </div>
    </ResultFrame>
  );
}

export default function TravelOptionsPage() {
  return (
    <Suspense fallback={null}>
      <TravelOptionsContent />
    </Suspense>
  );
}
