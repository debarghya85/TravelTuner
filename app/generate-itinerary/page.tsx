"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Minus,
  Plane,
  Plus,
  Sparkles,
  Star,
  Check,
  Lock,
  Users,
  Wallet,
} from "lucide-react";
import { setLoginReturnPath } from "../../lib/login-redirect";
import { openRazorpayCheckout } from "../../lib/razorpay-client";

type TripForm = {
  source: string;
  destination: string;
  days: string;
  budget: number;
  planId: "view-only" | "premium";
  travelStyle: string;
  adults: number;
  children: number;
  preferences: string;
};

export default function GenerateItineraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [adultInfo, setAdultInfo] = useState("");
  const [childrenInfo, setChildrenInfo] = useState("");
  const [form, setForm] = useState<TripForm>({
    source: "",
    destination: "",
    days: "",
    budget: 50000,
    planId: "premium",
    travelStyle: "",
    adults: 1,
    children: 0,
    preferences: "",
  });

  const handleBack = () => {
    router.push("/");
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "budget" ? Number(value) : value,
    }));
  };

  const updateTravelers = (
    field: "adults" | "children",
    direction: "plus" | "minus",
  ) => {
    setForm((current) => {
      const min = field === "adults" ? 1 : 0;
      const nextValue =
        direction === "plus" ? current[field] + 1 : current[field] - 1;

      if (direction === "plus" && current[field] >= 10) {
        const message =
          field === "adults"
            ? "Maximum 10 adults allowed"
            : "Maximum 10 children allowed";

        if (field === "adults") {
          setAdultInfo(message);
        } else {
          setChildrenInfo(message);
        }

        window.setTimeout(() => {
          if (field === "adults") {
            setAdultInfo("");
          } else {
            setChildrenInfo("");
          }
        }, 2000);

        return current;
      }

      if (field === "adults") {
        setAdultInfo("");
      } else {
        setChildrenInfo("");
      }

      return {
        ...current,
        [field]: Math.max(min, nextValue),
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Failed to generate itinerary";
        try {
          const errorData = await response.json();
          message = errorData?.error || errorData?.message || message;
        } catch {
          // Ignore non-JSON error bodies and fall back to the default message.
        }

        if (response.status === 401) {
          setLoginReturnPath("/generate-itinerary");
          router.push("/login");
          return;
        }
        throw new Error(message);
      }

      const data = await response.json();
      if (!data?.success) {
        throw new Error("Failed to start itinerary generation");
      }

      if (data.requestId) {
        window.sessionStorage.setItem(
          "travel-tuner:last-request-id",
          String(data.requestId),
        );
      }

      setCheckoutLoading(true);
      const opened = await openRazorpayCheckout({
        key: String(
          data.key_id ||
            data.checkout?.key_id ||
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
            "",
        ),
        amount: Number(data.amount || data.checkout?.amount || 0),
        currency: String(data.currency || data.checkout?.currency || "INR"),
        order_id: String(data.order_id || data.checkout?.order_id || ""),
        name: "Travel Tuner",
        description:
          form.planId === "premium"
            ? "Premium itinerary plan"
            : "View itinerary plan",
        prefill: {},
        theme: {
          color: "#ff6a00",
        },
        handler: async (response) => {
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              method: "upi",
            }),
          });

          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json().catch(() => ({}));
            throw new Error(
              errorData?.message || "Payment verification failed",
            );
          }

          const verifyData = await verifyResponse.json();
          if (verifyData?.jobId) {
            window.sessionStorage.setItem(
              "travel-tuner:last-job-id",
              String(verifyData.jobId),
            );
          }
          router.push("/progress");
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
          },
        },
      });

      if (!opened) {
        throw new Error("Failed to open Razorpay checkout");
      }

      setCheckoutLoading(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong!");
    } finally {
      setLoading(false);
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="generator-page">
      <div className="generator-page-bg" aria-hidden="true" />
      <section className="generator-shell">
        <div className="generator-layout">
          <div className="mobile-generator-top">
            <button
              type="button"
              className="mobile-back-icon"
              aria-label="Go back"
              onClick={handleBack}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="mobile-brand-lockup" aria-hidden="true">
              <img src="/tt_logo.png" alt="" />
            </div>
          </div>

          <div className="generator-copy">
            <button
              type="button"
              className="generator-back-link"
              aria-label="Go back"
              onClick={handleBack}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <img src="/tt_logo.png" alt="Travel Tuner" className="form-logo" />

            <form className="trip-builder-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  <span>
                    <MapPin size={16} />
                    From
                  </span>
                  <input
                    name="source"
                    placeholder="Enter departure city"
                    value={form.source}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>
                    <MapPin size={16} />
                    To
                  </span>
                  <input
                    name="destination"
                    placeholder="Enter destination city"
                    value={form.destination}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>
                    <Calendar size={16} />
                    Travel Days
                  </span>
                  <input
                    name="days"
                    type="number"
                    min={1}
                    placeholder="Select travel days"
                    value={form.days}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>
                    <Plane size={16} />
                    Travel Style
                  </span>
                  <select
                    name="travelStyle"
                    value={form.travelStyle}
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
                </label>
              </div>

              <label className="budget-field">
                <span>
                  <Wallet size={16} />
                  Budget (₹{Number(form.budget).toLocaleString("en-IN")})
                </span>
                <input
                  type="range"
                  min="1000"
                  max="300000"
                  step="1000"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                />
                <div className="range-labels">
                  <small>₹1K</small>
                  <small>₹3L</small>
                </div>
              </label>

              <div className="traveler-grid">
                <div>
                  <span className="field-label">
                    <Users size={16} />
                    Adults
                  </span>
                  <div className="traveler-stepper">
                    <button
                      type="button"
                      onClick={() => updateTravelers("adults", "minus")}
                      aria-label="Decrease adults"
                    >
                      <Minus size={16} />
                    </button>
                    <strong>{form.adults}</strong>
                    <button
                      type="button"
                      onClick={() => updateTravelers("adults", "plus")}
                      aria-label="Increase adults"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {adultInfo ? (
                    <small className="limit-note">{adultInfo}</small>
                  ) : null}
                </div>

                <div>
                  <span className="field-label">Children (0 - 10 Years)</span>
                  <div className="traveler-stepper">
                    <button
                      type="button"
                      onClick={() => updateTravelers("children", "minus")}
                      aria-label="Decrease children"
                    >
                      <Minus size={16} />
                    </button>
                    <strong>{form.children}</strong>
                    <button
                      type="button"
                      onClick={() => updateTravelers("children", "plus")}
                      aria-label="Increase children"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {childrenInfo ? (
                    <small className="limit-note">{childrenInfo}</small>
                  ) : null}
                </div>
              </div>

              <label className="preference-field">
                <span>Preferences (Optional)</span>
                <textarea
                  name="preferences"
                  placeholder="Tell us your preferences, places you love, must-see spots, etc."
                  value={form.preferences}
                  onChange={handleChange}
                />
              </label>

              <div className="plan-selector">
                <span className="field-label">Choose a plan</span>
                <div className="plan-selector-grid">
                  {[
                    {
                      id: "view-only",
                      price: "₹9",
                      title: "View Only",
                      copy: "Generate and view your itinerary",
                      features: [
                        "AI Generated Itinerary",
                        "Day-wise Plan",
                        "Online Viewing",
                      ],
                    },
                    {
                      id: "premium",
                      price: "₹49",
                      title: "Premium",
                      copy: "Unlock download, share, and export",
                      features: [
                        "Everything in View Only",
                        "Download PDF",
                        "Share with Friends",
                      ],
                    },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      className={`plan-card ${form.planId === plan.id ? "selected" : ""}`}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          planId: plan.id as "view-only" | "premium",
                        }))
                      }
                    >
                      <div className="plan-card-top">
                        <span className="plan-radio" aria-hidden="true">
                          <span />
                        </span>
                        <div className="plan-heading">
                          <strong>{plan.price}</strong>
                          <span>{plan.title}</span>
                        </div>
                        {plan.id === "premium" ? (
                          <span className="plan-badge">
                            <Star size={14} fill="currentColor" />
                            MOST POPULAR
                          </span>
                        ) : null}
                      </div>

                      <p className="plan-copy">{plan.copy}</p>

                      <div className="plan-divider" aria-hidden="true" />

                      <div className="plan-features" aria-hidden="true">
                        {plan.features.map((feature) => (
                          <div key={feature}>
                            <Check size={16} />
                            <span className="plan-card-span-imp">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div
                        className={`plan-action ${form.planId === plan.id ? "is-selected" : ""}`}
                      >
                        {form.planId === plan.id ? (
                          <>
                            <Check size={16} />
                            Selected
                          </>
                        ) : plan.id === "premium" ? (
                          <>
                            <Lock size={16} />
                            Choose Plan
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Choose Plan
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="submit-itinerary"
                type="submit"
                disabled={loading || checkoutLoading}
              >
                <Sparkles size={18} />
                {loading || checkoutLoading
                  ? "Opening Checkout..."
                  : "Generate Itinerary"}
              </button>

              <p className="secure-note">
                <Lock size={14} />
                Secure payments. Cancel anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
