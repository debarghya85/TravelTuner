"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Calendar,
  Wallet,
  Plane,
  Heart,
  Sparkles
} from "lucide-react";

/* 🇮🇳 INDIA TRAVEL IMAGES */
const travelImages = [
  "https://images.pexels.com/photos/356844/pexels-photo-356844.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/167698/pexels-photo-167698.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/784879/pexels-photo-784879.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1631660/pexels-photo-1631660.jpeg?auto=compress&cs=tinysrgb&w=900"
];

/* INTERESTS */
const interestOptions = [
  "Food",
  "Adventure",
  "Nature",
  "Beaches",
  "Mountains",
  "Culture",
  "Photography",
  "Spiritual"
];

export default function Form() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);

  const [form, setForm] = useState<any>({
    source: "",
    destination: "",
    days: "",
    budget: "",
    travelStyle: "",
    interests: [],
    travelers: "solo",
    preferences: ""
  });

  /* 🔁 AUTO CAROUSEL */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % travelImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getImg = (i: number) =>
    travelImages[(index + i) % travelImages.length];

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleInterest = (value: string) => {
    setForm((prev: any) => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i: string) => i !== value)
          : [...prev.interests, value]
      };
    });
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
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: any = {
    width: "100%",
    height: "42px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "13px",
    color: "#0f172a",
    boxSizing: "border-box"
  };

  const labelStyle: any = {
    fontSize: "12px",
    fontWeight: 700,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px"
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#e0f2fe 0%,#fff7ed 50%,#ffffff 100%)"
      }}
    >

      {/* ================= LEFT FORM ================= */}
      <div
        style={{
          flex: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "650px",
            background: "white",
            padding: "22px",
            borderRadius: "16px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.10)"
          }}
        >

          <h1 style={{ fontSize: "24px", fontWeight: 800 }}>
            🌍 Explore the Incredible World of Travel
          </h1>

          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Plan your next travel in seconds
          </p>

          {/* GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>

            <div>
              <div style={labelStyle}><MapPin size={14} /> From</div>
              <input name="source" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <div style={labelStyle}><MapPin size={14} /> To</div>
              <input name="destination" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <div style={labelStyle}><Calendar size={14} /> Days</div>
              <input name="days" type="number" min={1} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <div style={labelStyle}><Wallet size={14} /> Budget</div>
              <input name="budget" type="number" onChange={handleChange} style={inputStyle} />
            </div>

          </div>

          {/* STYLE */}
          <div style={{ marginTop: "12px" }}>
            <div style={labelStyle}><Plane size={14} /> Travel Style</div>
            <select name="travelStyle" onChange={handleChange} style={inputStyle} defaultValue="">
              <option value="" disabled>Select style</option>
              <option value="budget">Budget</option>
              <option value="comfort">Comfort</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* INTERESTS */}
          <div style={{ marginTop: "12px" }}>
            <div style={labelStyle}><Heart size={14} /> Interests</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
              {interestOptions.map((item) => {
                const active = form.interests.includes(item);

                return (
                  <div
                    key={item}
                    onClick={() => toggleInterest(item)}
                    style={{
                      padding: "6px 10px",
                      fontSize: "12px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      border: "1px solid #d1d5db",
                      background: active ? "#0f172a" : "white",
                      color: active ? "white" : "#0f172a"
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>

          <textarea
            name="preferences"
            placeholder="Preferences"
            onChange={handleChange}
            style={{
              ...inputStyle,
              marginTop: "12px",
              height: "80px",
              resize: "none"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "14px",
              width: "100%",
              height: "44px",
              background: "#0f172a",
              color: "white",
              borderRadius: "12px",
              fontWeight: 700,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Sparkles size={16} />
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>

        </form>
      </div>

      {/* ================= RIGHT CAROUSEL ================= */}
      <div
        style={{
          flex: 3,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          padding: "14px",
          height: "100vh"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            justifyContent: "center"
          }}
        >

          {/* 4 IMAGE STACK */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0,0,0,0.18)"
              }}
            >
              <img
                src={getImg(i)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}