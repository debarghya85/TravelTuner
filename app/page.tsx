"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Calendar,
  Wallet,
  Plane,
  Users,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";

const travelImages = [
  "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/356844/pexels-photo-356844.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

export default function Form() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [adultInfo, setAdultInfo] = useState("");
  const [childrenInfo, setChildrenInfo] = useState("");

  const [screen, setScreen] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  const [form, setForm] = useState<any>({
    source: "",
    destination: "",
    days: "",
    budget: 50000,
    travelStyle: "",
    adults: 1,
    children: 0,
    preferences: "",
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setScreen({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1180,
        isDesktop: width >= 1180,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isMobile, isTablet } = screen;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % travelImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getImg = (i: number) => travelImages[(index + i) % travelImages.length];

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateAdults = (type: "plus" | "minus") => {
    if (type === "plus") {
      setForm({ ...form, adults: form.adults + 1 });
    } else {
      if (form.adults > 1) {
        setForm({ ...form, adults: form.adults - 1 });
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.travelStyle) {
      alert("Select travel style");
      return;
    }

    if (!form.days || Number(form.days) <= 0) {
      alert("Days must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        adults: Number(form.adults),
        children: Number(form.children),
        budget: Number(form.budget),
      };

      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: any = {
    width: "100%",
    height: "34px",
    border: "1px solid #dbe4f0",
    borderRadius: "8px",
    padding: "0 16px",
    fontSize: "12px",
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    boxSizing: "border-box",
    fontWeight: 500,
  };

  const labelStyle: any = {
    fontSize: "11px",
    fontWeight: 700,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        overflowX: "hidden",
        maxWidth: "100vw",
        background:
          "linear-gradient(180deg,#edf4ff 0%, #ffffff 45%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          padding: isMobile ? "8px" : "18px",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            borderRadius: isMobile ? "18px" : "34px",
            overflow: "hidden",
            backgroundImage: "url('/form_bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "0",
            paddingBottom: isMobile ? "24px" : "40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.95) 28%, rgba(255,255,255,0.62) 52%, rgba(255,255,255,0.08) 76%)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: isTablet || isMobile ? "column" : "row",
              justifyContent: "space-between",
              gap: isMobile ? "12px" : "18px",
              height: "100%",
              padding: isMobile ? "14px" : "2px 36px",
              width: "100%",
              boxSizing: "border-box",
              overflowX: "hidden",
            }}
          >
            {/* LEFT SECTION */}
            <div
              style={{
                width: isTablet || isMobile ? "100%" : "60%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isMobile ? "center" : "flex-start",
                  width: "100%",
                }}
              >
                <img
                  src="/tt_logo.png"
                  alt="Travel Tuner"
                  style={{
                    height: isMobile ? "110px" : "180px",
                    width: "auto",
                    maxWidth: isMobile ? "170px" : "420px",
                    margin: isMobile ? "0 auto" : "0",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: isMobile ? "10px" : "14px",
                  color: "#101a2e",
                  marginBottom: "0px",
                  fontWeight: 500,
                }}
              >
                Plan your perfect trip...
              </div>
              <div
                style={{
                  marginTop: "18px",
                  fontSize: isMobile ? "8px" : "12px",
                  lineHeight: 1.6,
                  color: "#475569",
                  maxWidth: "600px",
                  fontWeight: 500,
                }}
              >
                Smart itineraries, personalized for you. Explore, customize and
                make every trip unforgettable.
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                style={{
                  marginTop: isMobile ? "24px" : "24px",
                  width: "100%",
                  maxWidth: "900px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.94)",
                  backdropFilter: "blur(14px)",
                  borderRadius: isMobile ? "24px" : "28px",
                  padding: isMobile ? "18px" : "22px",
                  border: "1px solid rgba(255,255,255,0.75)",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={labelStyle}>
                      <MapPin size={16} />
                      From
                    </div>

                    <input
                      name="source"
                      placeholder="Enter departure city"
                      style={inputStyle}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>
                      <MapPin size={16} />
                      To
                    </div>

                    <input
                      name="destination"
                      placeholder="Enter destination city"
                      style={inputStyle}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>
                      <Calendar size={16} />
                      Travel Days
                    </div>

                    <input
                      name="days"
                      type="number"
                      min={1}
                      placeholder="Select travel days"
                      style={inputStyle}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>
                      <Plane size={16} />
                      Travel Style
                    </div>

                    <select
                      name="travelStyle"
                      style={inputStyle}
                      defaultValue=""
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select your travel style
                      </option>

                      <option value="budget">Budget</option>
                      <option value="comfort">Comfort</option>
                      <option value="luxury">Luxury</option>
                      <option value="adventure">Adventure</option>
                    </select>
                  </div>
                </div>

                {/* BUDGET */}
                <div style={{ marginTop: "18px" }}>
                  <div style={labelStyle}>
                    <Wallet size={16} />
                    Budget (₹
                    {Number(form.budget).toLocaleString("en-IN")})
                  </div>

                  <input
                    type="range"
                    min="1000"
                    max="300000"
                    step="1000"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      cursor: "pointer",
                      accentColor: "#2563eb", // modern browsers (THIS fixes most cases)
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "4px",
                      fontWeight: 600,
                    }}
                  >
                    <span>₹1K</span>
                    <span>₹3L</span>
                  </div>
                </div>

                {/* TRAVELLERS */}
                <div
                  style={{
                    marginTop: "10px",
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {/* ADULTS */}
                  <div>
                    <div style={labelStyle}>
                      <Users size={16} />
                      Adults
                    </div>

                    <div
                      style={{
                        height: "34px",
                        border: "1px solid #dbe4f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        // padding: "0 10px",
                        background: "white",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAdultInfo("");

                          setForm({
                            ...form,
                            adults: Math.max(1, form.adults - 1),
                          });
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#f1f5f9",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Minus size={16} />
                      </button>

                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        {form.adults}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (form.adults >= 10) {
                            setAdultInfo("Maximum 10 adults allowed");

                            setTimeout(() => {
                              setAdultInfo("");
                            }, 2000);

                            return;
                          }

                          setAdultInfo("");

                          setForm({
                            ...form,
                            adults: form.adults + 1,
                          });
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#f1f5f9",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {adultInfo && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "10px",
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        {adultInfo}
                      </div>
                    )}
                  </div>

                  {/* CHILDREN */}
                  <div>
                    <div style={labelStyle}>Children (0 - 10 Years)</div>

                    <div
                      style={{
                        height: "34px",
                        border: "1px solid #dbe4f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        //padding: "0 10px",
                        background: "white",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setChildrenInfo("");

                          setForm({
                            ...form,
                            children: Math.max(0, form.children - 1),
                          });
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#f1f5f9",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Minus size={16} />
                      </button>

                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        {form.children}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (form.children >= 10) {
                            setChildrenInfo("Maximum 10 children allowed");

                            setTimeout(() => {
                              setChildrenInfo("");
                            }, 2000);

                            return;
                          }

                          setChildrenInfo("");

                          setForm({
                            ...form,
                            children: form.children + 1,
                          });
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#f1f5f9",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {childrenInfo && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "10px",
                          color: "#2563eb",
                          fontWeight: 600,
                        }}
                      >
                        {childrenInfo}
                      </div>
                    )}
                  </div>
                </div>

                {/* PREFERENCES */}
                <div style={{ marginTop: "16px" }}>
                  <div style={labelStyle}>✨ Preferences (Optional)</div>

                  <textarea
                    name="preferences"
                    placeholder="Tell us your preferences, places you love, must-see spots, etc."
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      height: "45px",
                      border: "1px solid #dbe4f0",
                      borderRadius: "6px",
                      padding: "12px",
                      resize: "none",
                      fontSize: "10px",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "18px",
                    width: "100%",
                    height: "56px",
                    border: "none",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(90deg,#0066ff 0%, #2383ff 100%)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 16px 40px rgba(7,25,89,0.24)",
                  }}
                >
                  <Sparkles size={18} />

                  {loading ? "Generating..." : "Generate Itinerary"}
                </button>
              </form>
            </div>

            {/* RIGHT IMAGES */}
            {!isMobile && (
              <div
                style={{
                  width: "390px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  paddingTop: "20px",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    height: "170px",
                    borderRadius: "22px",
                    overflow: "hidden",
                    marginLeft: "24px",
                    border: "3px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  }}
                >
                  <img
                    src={getImg(0)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    height: "190px",
                    borderRadius: "22px",
                    overflow: "hidden",
                    marginRight: "6px",
                    border: "3px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  }}
                >
                  <img
                    src={getImg(1)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    height: "150px",
                    borderRadius: "22px",
                    overflow: "hidden",
                    marginLeft: "24px",
                    border: "3px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  }}
                >
                  <img
                    src={getImg(2)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    height: "120px",
                    borderRadius: "22px",
                    overflow: "hidden",
                    marginRight: "6px",
                    border: "3px solid rgba(255,255,255,0.8)",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
                  }}
                >
                  <img
                    src={getImg(3)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
