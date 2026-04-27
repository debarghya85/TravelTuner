"use client";

import { useSearchParams } from "next/navigation";

export default function Result() {
  const params = useSearchParams();
  const data = JSON.parse(params.get("data") || "{}");

  const itinerary = data.itinerary || {};

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌍 Travel Itinerary</h1>

      {/* SUMMARY */}
      <div style={styles.card}>
        <h2>📌 Summary</h2>
        <p>{itinerary.summary}</p>
        <p><b>Destination:</b> {itinerary.destination}</p>
        <p><b>Best Time:</b> {itinerary.bestTimeToVisit}</p>
      </div>

      {/* DAYS */}
      {itinerary.days?.map((day: any, i: number) => (
        <div key={i} style={styles.card}>
          <h2>📅 {day.day} - {day.title}</h2>

          <ul>
            {day.activities?.map((act: string, j: number) => (
              <li key={j} style={styles.listItem}>{act}</li>
            ))}
          </ul>

          <p><b>🍽 Food:</b> {day.food}</p>
          <p><b>🏨 Stay:</b> {day.stay}</p>
        </div>
      ))}

      {/* BUDGET */}
      <div style={styles.card}>
        <h2>💰 Budget Breakdown</h2>
        <p><b>Total:</b> ₹{itinerary.totalEstimatedCost}</p>
        <p>🚆 Transport: ₹{itinerary.costBreakdown?.transport}</p>
        <p>🏨 Stay: ₹{itinerary.costBreakdown?.stay}</p>
        <p>🍽 Food: ₹{itinerary.costBreakdown?.food}</p>
        <p>🎟 Activities: ₹{itinerary.costBreakdown?.activities}</p>
      </div>

      {/* TRAVEL OPTIONS */}
      <div style={styles.card}>
        <h2>🚗 Travel Options</h2>

        <h3>To Destination</h3>
        {itinerary.travelOptions?.toDestination?.map((t: any, i: number) => (
          <p key={i}>➡ {t.mode} - {t.details} (₹{t.cost})</p>
        ))}

        <h3>Local Transport</h3>
        {itinerary.travelOptions?.localTransport?.map((t: any, i: number) => (
          <p key={i}>➡ {t.mode} (₹{t.cost})</p>
        ))}
      </div>

      {/* STAY OPTIONS */}
      <div style={styles.card}>
        <h2>🏨 Stay Options</h2>
        {itinerary.stayOptions?.map((s: any, i: number) => (
          <p key={i}>
            <b>{s.name}</b> - {s.location} (₹{s.pricePerNight}/night)
          </p>
        ))}
      </div>

      {/* FOOD OPTIONS */}
      <div style={styles.card}>
        <h2>🍴 Food Options</h2>
        {itinerary.foodOptions?.map((f: any, i: number) => (
          <p key={i}>
            <b>{f.type}</b>: {f.items?.join(", ")} (₹{f.cost})
          </p>
        ))}
      </div>

      {/* TIPS */}
      <div style={styles.card}>
        <h2>📝 Tips</h2>
        <ul>
          {itinerary.tips?.map((tip: string, i: number) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <button
        style={styles.button}
        onClick={() => (window.location.href = "/form")}
      >
        🔄 Plan Another Trip
      </button>
    </div>
  );
}

const styles: any = {
  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f5f7fb",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  listItem: {
    marginLeft: "20px",
    lineHeight: "1.6",
  },
  button: {
    display: "block",
    margin: "30px auto",
    padding: "12px 20px",
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};