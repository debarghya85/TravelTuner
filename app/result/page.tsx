"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

// ======================================================
// RESPONSIVE HOOK
// ======================================================
function useResponsive() {
  const [screen, setScreen] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;

      setScreen({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1200,
        isDesktop: width >= 1200,
      });
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return screen;
}

// ======================================================
// TRANSPORT META
// ======================================================
function getTransportMeta(mode: string) {
  const m = mode?.toLowerCase();

  switch (m) {
    case "flight":
    case "plane":
      return {
        icon: "✈️",
        bg: "linear-gradient(135deg,#7c3aed,#9333ea)",
      };

    case "train":
      return {
        icon: "🚆",
        bg: "linear-gradient(135deg,#2563eb,#3b82f6)",
      };

    case "bus":
      return {
        icon: "🚌",
        bg: "linear-gradient(135deg,#ea580c,#fb923c)",
      };

    case "cab":
    case "taxi":
      return {
        icon: "🚕",
        bg: "linear-gradient(135deg,#0f766e,#14b8a6)",
      };

    default:
      return {
        icon: "🚗",
        bg: "linear-gradient(135deg,#334155,#64748b)",
      };
  }
}

// ======================================================
// MAIN CONTENT
// ======================================================
function ItineraryContent() {
  const params = useSearchParams();

  const { isMobile, isTablet } = useResponsive();

  const [expandedTravel, setExpandedTravel] = useState<number[]>([]);

  const [expandedStay, setExpandedStay] = useState<number[]>([]);

  // ======================================================
  // PARSE DATA
  // ======================================================
  const itinerary = useMemo(() => {
    try {
      const data = JSON.parse(params.get("data") || "{}");

      return data.itinerary || {};
    } catch (e) {
      console.error(e);

      return {};
    }
  }, [params]);

  // ======================================================
  // TOGGLES
  // ======================================================
  const toggleTravel = (i: number) => {
    setExpandedTravel((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };

  const toggleStay = (i: number) => {
    setExpandedStay((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };

  // ======================================================
  // SHARE
  // ======================================================
  const shareOnWhatsApp = () => {
    let text = `🌍 *TRAVEL TUNER ITINERARY*\n\n`;

    text += `📍 Destination: ${itinerary.destination}\n`;
    text += `📅 Best Time: ${itinerary.bestTimeToVisit}\n\n`;

    text += `📝 ${itinerary.summary}\n\n`;

    itinerary.days?.forEach((d: any) => {
      text += `━━━━━━━━━━━━━━\n`;
      text += `📅 ${d.day} - ${d.title}\n`;
      text += `━━━━━━━━━━━━━━\n`;

      d.timeline?.forEach((t: any) => {
        text += `• ${t.time} → ${t.activity}\n`;
      });

      text += `\n🍽 ${d.food}\n`;
      text += `🏨 ${d.stay}\n`;
      text += `💰 ₹${d.estimatedDayCost}\n\n`;
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ======================================================
  // COMPONENTS
  // ======================================================
  const StatCard = ({ icon, title, value }: any) => (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <div>
        <div style={styles.statLabel}>{title}</div>

        <div style={styles.statValue}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ======================================================
            HERO
        ====================================================== */}

        {/* HERO BANNER */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "2243 / 701",
            borderRadius: isMobile ? "18px" : "30px",
            overflow: "hidden",
            marginBottom: "36px",
            boxShadow: "0 20px 45px rgba(15,23,42,0.18)",
            background: "#0f172a",
          }}
        >
          {/* BANNER IMAGE */}
          <img
            src="/itinery_result.png"
            alt="Travel Tuner Itinerary Banner"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
            onError={() => {
              console.log("Banner failed to load");
            }}
          />
        </div>

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>📌 Summary</div>

          <p style={styles.summaryText}>{itinerary.summary}</p>

          <div
            style={{
              ...styles.summaryGrid,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <div style={styles.summaryBox}>
              <div style={styles.summaryLabel}>📍 Destination</div>

              <div style={styles.summaryValue}>{itinerary.destination}</div>
            </div>

            <div style={styles.summaryBox}>
              <div style={styles.summaryLabel}>📅 Best Time</div>

              <div style={styles.summaryValue}>{itinerary.bestTimeToVisit}</div>
            </div>
          </div>
        </section>

        {/* ======================================================
            TRAVELER INFO
        ====================================================== */}

        {itinerary.travelerInfo && (
          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>👨‍👩‍👧‍👦 Traveler Information</div>

            <div
              style={{
                ...styles.statsGrid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isTablet
                    ? "repeat(2,1fr)"
                    : "repeat(3,1fr)",
              }}
            >
              <StatCard
                icon="👥"
                title="Travelers"
                value={itinerary.travelerInfo.travelers}
              />

              <StatCard
                icon="🧑"
                title="Adults"
                value={itinerary.travelerInfo.adults}
              />

              <StatCard
                icon="🧒"
                title="Children"
                value={itinerary.travelerInfo.children}
              />
            </div>
          </section>
        )}

        {/* ======================================================
            DAYS
        ====================================================== */}

        {itinerary.days?.map((day: any, i: number) => (
          <section key={i} style={styles.dayCard}>
            <div style={styles.dayHeader}>
              📅 {day.day} - {day.title}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.3fr .7fr",
                gap: "28px",
              }}
            >
              {/* LEFT */}
              <div>
                <div style={styles.timelineWrap}>
                  {day.timeline?.map((item: any, idx: number) => (
                    <div key={idx} style={styles.timelineRow}>
                      <div style={styles.timelineLeft}>
                        <div style={styles.timelineDot} />

                        {idx !== day.timeline.length - 1 && (
                          <div style={styles.timelineLine} />
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div style={styles.timelineTime}>{item.time}</div>

                        <div style={styles.timelineActivity}>
                          {item.activity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {day.activities?.length > 0 && (
                  <ul style={styles.activityList}>
                    {day.activities.map((a: string, j: number) => (
                      <li key={j} style={styles.activityItem}>
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* RIGHT */}
              <div style={styles.dayInfoPanel}>
                <div style={styles.infoPanelRow}>🍽 {day.food}</div>

                <div style={styles.infoPanelRow}>🏨 {day.stay}</div>

                <div
                  style={{
                    ...styles.costBadge,
                    marginTop: "auto",
                  }}
                >
                  ₹{day.estimatedDayCost}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ======================================================
            BOTTOM GRID
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* STAY */}
          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>🏨 Stay Options</div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {itinerary.stayOptions?.map((s: any, i: number) => {
                const expanded = expandedStay.includes(i);

                return (
                  <div key={i} style={styles.optionCard}>
                    <div style={styles.optionTop}>
                      <div>
                        <div style={styles.optionTitle}>{s.name}</div>

                        <div style={styles.optionSub}>📍 {s.location}</div>
                      </div>

                      <div style={styles.optionPrice}>
                        ₹{s.pricePerNight}
                        /night
                      </div>
                    </div>

                    <div style={styles.optionMeta}>
                      ⭐ {s.rating}
                      <span>👥 {s.occupancy}</span>
                    </div>

                    <button
                      style={styles.detailsBtn}
                      onClick={() => toggleStay(i)}
                    >
                      {expanded ? "Hide Details" : "View Details"}
                    </button>

                    {expanded && (
                      <div style={styles.expandedBox}>
                        <div>
                          <b>Room:</b> {s.roomCategory}
                        </div>

                        <div>
                          <b>Rooms:</b> {s.roomsRequired}
                        </div>

                        <div>
                          <b>Recommended:</b> {s.recommendedFor}
                        </div>

                        {s.amenities?.length > 0 && (
                          <div style={styles.amenityWrap}>
                            {s.amenities.map((a: string, j: number) => (
                              <div key={j} style={styles.amenityTag}>
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          {/* ======================================================
              TRAVEL OPTIONS
          ====================================================== */}

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>🚆 Travel Options</div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {itinerary.travelOptions?.toDestination?.map(
                (t: any, i: number) => {
                  const expanded = expandedTravel.includes(i);

                  const meta = getTransportMeta(t.mode);

                  return (
                    <div key={i} style={styles.optionCard}>
                      <div style={styles.optionTop}>
                        <div
                          style={{
                            display: "flex",
                            gap: "14px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              ...styles.transportType,
                              background: meta.bg,
                            }}
                          >
                            {meta.icon}
                          </div>

                          <div>
                            <div style={styles.optionTitle}>{t.name}</div>

                            <div style={styles.optionSub}>{t.provider}</div>
                          </div>
                        </div>

                        <div style={styles.optionPrice}>₹{t.cost}</div>
                      </div>

                      <div style={styles.optionMeta}>
                        🕒 {t.departureTime} → {t.arrivalTime}
                        <span>⏱ {t.duration}</span>
                      </div>

                      <button
                        style={styles.detailsBtn}
                        onClick={() => toggleTravel(i)}
                      >
                        {expanded ? "Hide Details" : "View Details"}
                      </button>

                      {expanded && (
                        <div style={styles.expandedBox}>
                          <div>
                            <b>Route:</b> {t.from} → {t.to}
                          </div>

                          <div>
                            <b>Class:</b> {t.class}
                          </div>

                          <div>
                            <b>Frequency:</b> {t.frequency}
                          </div>

                          <div>
                            <b>Notes:</b> {t.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </section>
        </div>

        {/* ======================================================
            LOCAL TRANSPORT + STAY
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          {/* ======================================================
              BUDGET
          ====================================================== */}

          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>💰 Budget Breakdown</div>

            <div
              style={{
                ...styles.budgetGrid,
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2,1fr)",
              }}
            >
              {[
                {
                  label: "Total",
                  value: itinerary.totalEstimatedCost,
                  icon: "💵",
                },
                {
                  label: "Transport",
                  value: itinerary.costBreakdown?.transport,
                  icon: "🚆",
                },
                {
                  label: "Stay",
                  value: itinerary.costBreakdown?.stay,
                  icon: "🏨",
                },
                {
                  label: "Food",
                  value: itinerary.costBreakdown?.food,
                  icon: "🍽",
                },
                {
                  label: "Activities",
                  value: itinerary.costBreakdown?.activities,
                  icon: "🎟",
                },
              ].map((b, i) => (
                <div key={i} style={styles.budgetCard}>
                  <div style={styles.budgetIcon}>{b.icon}</div>

                  <div style={styles.budgetLabel}>{b.label}</div>

                  <div style={styles.budgetValue}>₹{b.value}</div>
                </div>
              ))}
            </div>
          </section>
          {/* LOCAL */}
          {itinerary.travelOptions?.localTransport?.length > 0 && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>🚕 Local Transport</div>

              {itinerary.travelOptions.localTransport.map(
                (l: any, i: number) => (
                  <div key={i} style={styles.localTransportCard}>
                    <div style={styles.localTransportTitle}>{l.mode}</div>

                    <div style={styles.localTransportText}>{l.details}</div>

                    <div style={styles.localTransportPrice}>
                      ₹{l.dailyCost} / day
                    </div>
                  </div>
                ),
              )}
            </section>
          )}
        </div>

        {/* ======================================================
            ACTION BUTTONS
        ====================================================== */}

        <div
          style={{
            ...styles.actionWrap,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <button
            style={{
              ...styles.actionBtn,
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
            }}
            onClick={shareOnWhatsApp}
          >
            📲 Share on WhatsApp
          </button>

          <button
            style={{
              ...styles.actionBtn,
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            }}
            onClick={() => (window.location.href = "/")}
          >
            🔄 Plan Another Trip
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================
export default function Result() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          Loading...
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}

// ======================================================
// STYLES
// ======================================================
const styles: any = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(to bottom,#edf4ff,#f8fbff)",
    padding: "20px",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  container: {
    width: "100%",
    maxWidth: "1450px",
    margin: "0 auto",
    fontFamily: "Inter, Segoe UI, sans-serif",
    boxSizing: "border-box",
  },

  // HERO
  hero: {
    width: "100%",
    background: "linear-gradient(135deg,#ffffff,#e8f2ff)",
    borderRadius: "32px",
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
    marginBottom: "26px",
  },

  heroLeft: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroRight: {
    width: "50%",
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  brand: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: "24px",
  },

  heroSubtitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
  },

  heroTitle: {
    margin: "10px 0 20px",
    lineHeight: 1,
    fontWeight: "900",
    color: "#0f172a",
  },

  heroText: {
    maxWidth: "560px",
    fontSize: "18px",
    lineHeight: 1.8,
    color: "#475569",
    marginBottom: "28px",
  },

  heroFeatures: {
    display: "grid",
    gap: "16px",
  },

  featureCard: {
    background: "#ffffffcc",
    border: "1px solid #dbeafe",
    padding: "18px",
    borderRadius: "18px",
    backdropFilter: "blur(10px)",
  },

  featureIcon: {
    fontSize: "24px",
    marginBottom: "10px",
  },

  featureText: {
    fontWeight: "700",
    color: "#1e293b",
  },

  // SECTIONS
  sectionCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },

  sectionHeader: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "22px",
  },

  // SUMMARY
  summaryText: {
    color: "#475569",
    lineHeight: 1.8,
    fontSize: "17px",
    marginBottom: "24px",
  },

  summaryGrid: {
    display: "grid",
    gap: "18px",
  },

  summaryBox: {
    background: "#f8fbff",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "20px",
  },

  summaryLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "10px",
    textTransform: "uppercase",
  },

  summaryValue: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
  },

  // STATS
  statsGrid: {
    display: "grid",
    gap: "18px",
  },

  statCard: {
    background: "linear-gradient(135deg,#ffffff,#f8fbff)",
    border: "1px solid #dbeafe",
    borderRadius: "22px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  statIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background: "linear-gradient(135deg,#2563eb,#60a5fa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "28px",
  },

  statLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "6px",
    textTransform: "uppercase",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#0f172a",
  },

  // DAYS
  dayCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },

  dayHeader: {
    fontSize: "34px",
    fontWeight: "900",
    marginBottom: "26px",
    color: "#0f172a",
  },

  timelineWrap: {
    position: "relative",
  },

  timelineRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
  },

  timelineLeft: {
    width: "24px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },

  timelineDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#2563eb",
    marginTop: "8px",
    zIndex: 2,
  },

  timelineLine: {
    position: "absolute",
    top: "24px",
    width: "2px",
    bottom: "-28px",
    background: "#bfdbfe",
  },

  timelineTime: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "6px",
  },

  timelineActivity: {
    color: "#475569",
    lineHeight: 1.7,
  },

  activityList: {
    marginTop: "20px",
    paddingLeft: "22px",
  },

  activityItem: {
    marginBottom: "10px",
    color: "#334155",
    lineHeight: 1.8,
  },

  dayInfoPanel: {
    background: "linear-gradient(135deg,#f8fbff,#eef5ff)",
    borderRadius: "24px",
    border: "1px solid #dbeafe",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  infoPanelRow: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "16px",
    fontWeight: "700",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
  },

  costBadge: {
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    color: "#fff",
    borderRadius: "18px",
    padding: "18px",
    fontSize: "22px",
    fontWeight: "900",
    textAlign: "center",
  },

  // BUDGET
  budgetGrid: {
    display: "grid",
    gap: "16px",
  },

  budgetCard: {
    background: "#f8fbff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #dbeafe",
  },

  budgetIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  budgetLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "6px",
    textTransform: "uppercase",
  },

  budgetValue: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#0f172a",
  },

  // OPTION
  optionCard: {
    borderRadius: "22px",
    background: "linear-gradient(135deg,#ffffff,#f8fbff)",
    border: "1px solid #dbeafe",
    padding: "22px",
  },

  optionTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  transportType: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "24px",
  },

  optionTitle: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#0f172a",
  },

  optionSub: {
    color: "#64748b",
    marginTop: "6px",
  },

  optionPrice: {
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    color: "#fff",
    borderRadius: "16px",
    padding: "14px 18px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  optionMeta: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    color: "#475569",
    fontWeight: "600",
    marginBottom: "18px",
  },

  detailsBtn: {
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  expandedBox: {
    marginTop: "20px",
    borderTop: "1px solid #dbeafe",
    paddingTop: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    color: "#334155",
    lineHeight: 1.7,
  },

  // AMENITIES
  amenityWrap: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
  },

  amenityTag: {
    background: "#eef4ff",
    border: "1px solid #bfdbfe",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e40af",
  },

  // LOCAL
  localTransportCard: {
    background: "linear-gradient(135deg,#ffffff,#f8fbff)",
    border: "1px solid #dbeafe",
    borderRadius: "22px",
    padding: "24px",
  },

  localTransportTitle: {
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "12px",
    color: "#0f172a",
  },

  localTransportText: {
    color: "#475569",
    lineHeight: 1.8,
    marginBottom: "20px",
  },

  localTransportPrice: {
    display: "inline-block",
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: "14px",
    fontWeight: "800",
  },

  // ACTION
  actionWrap: {
    display: "flex",
    gap: "18px",
    marginTop: "30px",
    marginBottom: "40px",
  },

  actionBtn: {
    flex: 1,
    border: "none",
    padding: "18px 24px",
    borderRadius: "18px",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.18)",
  },
};
