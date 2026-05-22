"use client";

export const dynamic = "force-dynamic";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

// =========================
// RESPONSIVE HELPER
// =========================
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
        isTablet:
          width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    checkScreen();

    window.addEventListener(
      "resize",
      checkScreen
    );

    return () =>
      window.removeEventListener(
        "resize",
        checkScreen
      );
  }, []);

  return screen;
}

// =========================
// TRANSPORT STYLE HELPER
// =========================
function getTransportMeta(mode: string) {
  const m = mode?.toLowerCase();

  switch (m) {
    case "flight":
    case "plane":
      return {
        icon: "✈",
        bg: "linear-gradient(to right, #7c3aed, #a855f7)",
      };

    case "train":
      return {
        icon: "🚆",
        bg: "linear-gradient(to right, #2563eb, #3b82f6)",
      };

    case "bus":
      return {
        icon: "🚌",
        bg: "linear-gradient(to right, #ea580c, #fb923c)",
      };

    case "cab":
    case "taxi":
    case "auto":
      return {
        icon: "🚕",
        bg: "linear-gradient(to right, #0f766e, #14b8a6)",
      };

    default:
      return {
        icon: "🚗",
        bg: "linear-gradient(to right, #475569, #64748b)",
      };
  }
}

// =========================
// CONTENT COMPONENT
// =========================
function ItineraryContent() {
  const params = useSearchParams();

  const { isMobile, isTablet } =
    useResponsive();

  const [expandedTravel, setExpandedTravel] =
    useState<number[]>([]);

  const [expandedStay, setExpandedStay] =
    useState<number[]>([]);

  const toggleTravel = (index: number) => {
    setExpandedTravel((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const toggleStay = (index: number) => {
    setExpandedStay((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  let itinerary: any = {};

  try {
    const data = JSON.parse(
      params.get("data") || "{}"
    );

    itinerary = data.itinerary || {};
  } catch (e) {
    console.error(
      "Failed to parse itinerary data",
      e
    );
  }

  return (
    <div style={styles.container}>
      {/* TITLE */}
      <h1
        style={{
          ...styles.title,
          fontSize: isMobile
            ? "28px"
            : isTablet
            ? "36px"
            : "44px",
        }}
      >
        🌍 Travel Itinerary
      </h1>

      {/* SUMMARY */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          📌 Summary
        </h2>

        <p>{itinerary.summary}</p>

        <p>
          <b>Destination:</b>{" "}
          {itinerary.destination}
        </p>

        <p>
          <b>Best Time:</b>{" "}
          {itinerary.bestTimeToVisit}
        </p>
      </div>

      {/* DAYS */}
      {itinerary.days?.map(
        (day: any, i: number) => (
          <div key={i} style={styles.card}>
            <h2 style={styles.sectionTitle}>
              📅 {day.day} - {day.title}
            </h2>

            {day.timeline && (
              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                {day.timeline.map(
                  (
                    item: any,
                    idx: number
                  ) => (
                    <div
                      key={idx}
                      style={
                        styles.timelineItem
                      }
                    >
                      <b>{item.time}</b> —{" "}
                      {item.activity}
                    </div>
                  )
                )}
              </div>
            )}

            <ul
              style={{
                paddingLeft: "20px",
              }}
            >
              {day.activities?.map(
                (
                  act: string,
                  j: number
                ) => (
                  <li
                    key={j}
                    style={styles.listItem}
                  >
                    {act}
                  </li>
                )
              )}
            </ul>

            <p>
              <b>🍽 Food:</b> {day.food}
            </p>

            <p>
              <b>🏨 Stay:</b> {day.stay}
            </p>

            <p>
              <b>
                💵 Estimated Day Cost:
              </b>{" "}
              ₹{day.estimatedDayCost}
            </p>
          </div>
        )
      )}

      {/* BUDGET */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          💰 Budget Breakdown
        </h2>

        <div
          style={{
            ...styles.infoGrid,
            gridTemplateColumns:
              isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2,1fr)"
                : "repeat(auto-fit,minmax(220px,1fr))",
          }}
        >
          {[
            {
              label: "Total",
              value:
                itinerary.totalEstimatedCost,
            },
            {
              label: "Transport",
              value:
                itinerary.costBreakdown
                  ?.transport,
            },
            {
              label: "Stay",
              value:
                itinerary.costBreakdown?.stay,
            },
            {
              label: "Food",
              value:
                itinerary.costBreakdown?.food,
            },
            {
              label: "Activities",
              value:
                itinerary.costBreakdown
                  ?.activities,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={styles.infoBox}
            >
              <div style={styles.infoLabel}>
                {item.label}
              </div>

              <div style={styles.infoValue}>
                ₹{item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRAVEL OPTIONS */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          🚗 Travel Options
        </h2>

        <h3 style={styles.subTitle}>
          To Destination
        </h3>

        {itinerary.travelOptions?.toDestination?.map(
          (t: any, i: number) => {
            const expanded =
              expandedTravel.includes(i);

            const transport =
              getTransportMeta(t.mode);

            return (
              <div
                key={i}
                style={styles.optionCard}
              >
                <div
                  style={
                    styles.optionTopBar
                  }
                ></div>

                <div
                  style={{
                    ...styles.optionHeading,
                    flexDirection:
                      isMobile
                        ? "column"
                        : "row",
                  }}
                >
                  {/* LEFT */}
                  <div
                    style={
                      styles.optionTitleLeft
                    }
                  >
                    <div
                      style={{
                        ...styles.transportBadge,
                        background:
                          transport.bg,
                      }}
                    >
                      {transport.icon}{" "}
                      {t.mode?.toUpperCase()}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <h3
                        style={
                          styles.transportTitle
                        }
                      >
                        {t.name}
                      </h3>

                      <p
                        style={
                          styles.transportProvider
                        }
                      >
                        {t.provider}
                      </p>

                      <div
                        style={
                          styles.quickInfo
                        }
                      >
                        🕒{" "}
                        {t.departureTime} →{" "}
                        {t.arrivalTime}
                      </div>

                      <div
                        style={
                          styles.quickInfo
                        }
                      >
                        ⏱ {t.duration}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    style={{
                      display: "flex",

                      flexDirection:
                        "column",

                      gap: "12px",

                      width: isMobile
                        ? "100%"
                        : "220px",

                      maxWidth: "100%",

                      flexShrink: 0,

                      boxSizing:
                        "border-box",
                    }}
                  >
                    <div
                      style={styles.priceTag}
                    >
                      ₹{t.cost}
                    </div>

                    <button
                      style={
                        styles.expandButton
                      }
                      onClick={() =>
                        toggleTravel(i)
                      }
                    >
                      {expanded
                        ? "Hide Details ▲"
                        : "View Details ▼"}
                    </button>
                  </div>
                </div>

                {/* EXPANDED */}
                {expanded && (
                  <>
                    <div
                      style={{
                        ...styles.infoGrid,
                        gridTemplateColumns:
                          isMobile
                            ? "1fr"
                            : isTablet
                            ? "repeat(2,1fr)"
                            : "repeat(auto-fit,minmax(220px,1fr))",
                      }}
                    >
                      {[
                        {
                          label: "Route",
                          value: `${t.from} → ${t.to}`,
                        },
                        {
                          label:
                            "Departure",
                          value:
                            t.departureTime,
                        },
                        {
                          label:
                            "Arrival",
                          value:
                            t.arrivalTime,
                        },
                        {
                          label:
                            "Duration",
                          value:
                            t.duration,
                        },
                        {
                          label: "Class",
                          value: t.class,
                        },
                        {
                          label:
                            "Number",
                          value: t.number,
                        },
                      ].map(
                        (item, idx) => (
                          <div
                            key={idx}
                            style={
                              styles.infoBox
                            }
                          >
                            <div
                              style={
                                styles.infoLabel
                              }
                            >
                              {
                                item.label
                              }
                            </div>

                            <div
                              style={
                                styles.infoValue
                              }
                            >
                              {
                                item.value
                              }
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {t.notes && (
                      <div
                        style={
                          styles.noteBox
                        }
                      >
                        💡 {t.notes}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* STAY OPTIONS */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          🏨 Stay Options
        </h2>

        {itinerary.stayOptions?.map(
          (s: any, i: number) => {
            const expanded =
              expandedStay.includes(i);

            return (
              <div
                key={i}
                style={styles.optionCard}
              >
                <div
                  style={
                    styles.optionTopBar
                  }
                ></div>

                <div
                  style={{
                    ...styles.hotelHeader,
                    flexDirection:
                      isMobile
                        ? "column"
                        : "row",
                  }}
                >
                  {/* LEFT */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={
                        styles.hotelType
                      }
                    >
                      {s.type}
                    </div>

                    <h3
                      style={
                        styles.hotelName
                      }
                    >
                      {s.name}
                    </h3>

                    <p
                      style={
                        styles.locationText
                      }
                    >
                      📍 {s.location}
                    </p>

                    <div
                      style={
                        styles.quickInfo
                      }
                    >
                      🛏{" "}
                      {s.roomCategory}
                    </div>

                    <div
                      style={
                        styles.quickInfo
                      }
                    >
                      👥{" "}
                      {s.recommendedFor}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: "12px",
                      width: isMobile
                        ? "100%"
                        : "220px",
                      maxWidth: "100%",
                      flexShrink: 0,
                      boxSizing:
                        "border-box",
                    }}
                  >
                    <div
                      style={{
                        ...styles.priceTag,
                      }}
                    >
                      ₹
                      {s.pricePerNight}
                      /night
                    </div>

                    <div
                      style={{
                        ...styles.ratingBadge,
                      }}
                    >
                      ⭐ {s.rating}
                    </div>

                    <button
                      style={
                        styles.expandButton
                      }
                      onClick={() =>
                        toggleStay(i)
                      }
                    >
                      {expanded
                        ? "Hide Details ▲"
                        : "View Details ▼"}
                    </button>
                  </div>
                </div>

                {/* EXPANDED */}
                {expanded && (
                  <>
                    <div
                      style={{
                        ...styles.infoGrid,
                        gridTemplateColumns:
                          isMobile
                            ? "1fr"
                            : isTablet
                            ? "repeat(2,1fr)"
                            : "repeat(3,1fr)",
                      }}
                    >
                      <div
                        style={
                          styles.infoBox
                        }
                      >
                        <div
                          style={
                            styles.infoLabel
                          }
                        >
                          Room Category
                        </div>

                        <div
                          style={
                            styles.infoValue
                          }
                        >
                          {
                            s.roomCategory
                          }
                        </div>
                      </div>

                      <div
                        style={
                          styles.infoBox
                        }
                      >
                        <div
                          style={
                            styles.infoLabel
                          }
                        >
                          Price Per Night
                        </div>

                        <div
                          style={
                            styles.infoValue
                          }
                        >
                          ₹
                          {
                            s.pricePerNight
                          }
                        </div>
                      </div>

                      <div
                        style={
                          styles.infoBox
                        }
                      >
                        <div
                          style={
                            styles.infoLabel
                          }
                        >
                          Recommended
                          For
                        </div>

                        <div
                          style={
                            styles.infoValue
                          }
                        >
                          {
                            s.recommendedFor
                          }
                        </div>
                      </div>
                    </div>

                    <div
                      style={
                        styles.amenityWrap
                      }
                    >
                      {s.amenities?.map(
                        (
                          a: string,
                          idx: number
                        ) => (
                          <div
                            key={idx}
                            style={
                              styles.amenityTag
                            }
                          >
                            ✓ {a}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          }
        )}
      </div>

      <button
        style={styles.button}
        onClick={() => (window.location.href = "/")}
      >
        🔄 Plan Another Trip
      </button>
    </div>
  );
}

// =========================
// MAIN PAGE
// =========================
export default function Result() {
  return (
    <Suspense
      fallback={
        <div style={styles.container}>
          <h1 style={styles.title}>
            Loading your itinerary...
          </h1>
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}

// =========================
// STYLES
// =========================
const styles: any = {
  container: {
    maxWidth: "1200px",

    margin: "0 auto",

    padding: "16px",

    fontFamily: "Segoe UI, sans-serif",

    background:
      "linear-gradient(to bottom, #eef4ff, #f8fbff)",

    minHeight: "100vh",

    boxSizing: "border-box",

    overflowX: "hidden",

    width: "100%",
  },

  title: {
    textAlign: "center",
    marginBottom: "32px",
    fontWeight: "800",
    color: "#0f172a",
  },

  button: {
    border: "none",

    background:
      "linear-gradient(to right, #2563eb, #3b82f6)",

    color: "#fff",

    padding: "16px 22px",

    borderRadius: "16px",

    cursor: "pointer",

    fontWeight: "800",

    fontSize: "16px",

    boxShadow:
      "0 8px 20px rgba(37,99,235,0.28)",

    width: "100%",

    maxWidth: "420px",

    display: "block",

    margin: "40px auto 0",

    boxSizing: "border-box",

    transition: "0.3s ease",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    marginBottom: "28px",
    borderRadius: "24px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.08)",
    border:
      "1px solid rgba(226,232,240,0.8)",
    overflow: "hidden",
    width: "100%",
    boxSizing: "border-box",
  },

  sectionTitle: {
    fontSize: "30px",
    fontWeight: "800",
    marginBottom: "24px",
    color: "#0f172a",
  },

  subTitle: {
    fontSize: "22px",
    fontWeight: "700",
    marginTop: "10px",
    marginBottom: "20px",
    color: "#1e293b",
  },

  optionCard: {
    background:
      "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",

    padding: "18px",

    borderRadius: "22px",

    marginBottom: "20px",

    border: "1px solid #dbeafe",

    boxShadow:
      "0 8px 22px rgba(59,130,246,0.08)",

    position: "relative",

    overflow: "hidden",

    boxSizing: "border-box",

    width: "100%",

    maxWidth: "100%",
  },

  optionTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background:
      "linear-gradient(to right, #2563eb, #06b6d4)",
  },

  optionHeading: {
    display: "flex",

    justifyContent: "space-between",

    gap: "14px",

    marginBottom: "22px",

    width: "100%",

    boxSizing: "border-box",

    alignItems: "flex-start",

    flexWrap: "wrap",
  },

  optionTitleLeft: {
    display: "flex",

    alignItems: "flex-start",

    gap: "12px",

    minWidth: 0,

    flex: 1,

    width: "100%",

    boxSizing: "border-box",
  },

  transportBadge: {
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.12)",
  },

  transportTitle: {
    margin: 0,

    fontSize: "clamp(22px, 5vw, 30px)",

    color: "#0f172a",

    fontWeight: "800",

    lineHeight: "1.2",

    wordBreak: "break-word",
  },

  transportProvider: {
    margin: "6px 0",
    color: "#64748b",
  },

  quickInfo: {
    marginTop: "8px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "1.7",
  },

  hotelType: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "14px",
  },

  hotelName: {
    fontSize: "clamp(24px, 5vw, 34px)",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "10px",
    marginTop: 0,
    lineHeight: "1.2",
    wordBreak: "break-word",
  },

  locationText: {
    color: "#64748b",
    margin: 0,
    fontSize: "16px",
    wordBreak: "break-word",
  },

  priceTag: {
    background:
      "linear-gradient(to right, #16a34a, #22c55e)",

    color: "#fff",

    padding: "14px 18px",

    borderRadius: "16px",

    fontWeight: "800",

    fontSize: "18px",

    boxShadow:
      "0 4px 12px rgba(34,197,94,0.25)",

    width: "100%",

    textAlign: "center",

    boxSizing: "border-box",
  },

  ratingBadge: {
    background:
      "linear-gradient(to right, #f59e0b, #fbbf24)",

    color: "#fff",

    padding: "14px 18px",

    borderRadius: "16px",

    fontWeight: "800",

    textAlign: "center",

    boxShadow:
      "0 4px 12px rgba(245,158,11,0.25)",

    width: "100%",

    boxSizing: "border-box",
  },

  expandButton: {
    border: "none",

    background:
      "linear-gradient(to right, #2563eb, #3b82f6)",

    color: "#fff",

    padding: "14px 18px",

    borderRadius: "14px",

    cursor: "pointer",

    fontWeight: "700",

    fontSize: "14px",

    boxShadow:
      "0 4px 12px rgba(37,99,235,0.25)",

    width: "100%",

    boxSizing: "border-box",
  },

  hotelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "26px",
    width: "100%",
    boxSizing: "border-box",
  },

  infoGrid: {
    display: "grid",
    gap: "18px",
    width: "100%",
    marginTop: "10px",
  },

  infoBox: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
    width: "100%",
  },

  infoLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "10px",
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  noteBox: {
    marginTop: "22px",
    padding: "16px",
    borderRadius: "16px",
    background: "#eff6ff",
    color: "#1e40af",
    fontWeight: "600",
  },

  amenityWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "22px",
  },

  amenityTag: {
    background: "#f1f5f9",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },

  timelineItem: {
    padding: "14px 0",
    borderBottom:
      "1px dashed #d1d5db",
  },

  listItem: {
    marginLeft: "18px",
    marginBottom: "10px",
    lineHeight: "1.8",
    color: "#334155",
  },
};