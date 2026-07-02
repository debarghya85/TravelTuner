"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { consumeLoginReturnPath } from "../../lib/login-redirect";

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+81"];

export default function LoginPage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const digitsOnly = useMemo(
    () => mobile.replace(/\D/g, "").slice(0, 15),
    [mobile],
  );

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: digitsOnly }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to send OTP");
      }
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: digitsOnly, otp }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "OTP verification failed");
      }
      window.location.assign(consumeLoginReturnPath() || "/itineraries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell scenic-shell">
      <section className="login-mobile-stack">
        <div className="login-copy-brand login-copy-brand--mobile">
          <img src="/tt_logo.png" alt="Travel Tuner" />
          <span>
            <BadgeCheck size={16} />
            AI-Powered Travel Itinerary Planner
          </span>
        </div>

        <section className="login-card-pane login-card-pane--mobile">
          <Link href="/" className="login-back">
            <ArrowLeft size={16} />
            Back home
          </Link>

          <div className="login-card-title">
            <h2>
              Access your saved <span>itineraries</span>
            </h2>
          </div>

          <p className="login-card-copy">
            Use your mobile number to sign in and see every itinerary tied to
            your account.
          </p>

          <div className="login-field-group">
            <label>Mobile number</label>
            <div className="phone-field">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {COUNTRY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 15))
                }
                placeholder="98765 43210"
              />
            </div>
          </div>

          {step === 2 ? (
            <div className="login-field-group">
              <label>OTP</label>
              <input
                className="otp-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
              />
            </div>
          ) : null}

          <button
            className="login-primary-btn"
            type="button"
            onClick={step === 1 ? sendOtp : verifyOtp}
            disabled={loading || !digitsOnly}
          >
            {loading
              ? "Please wait..."
              : step === 1
                ? "Send OTP"
                : "Verify & Login"}
            <ArrowRight size={24} />
          </button>

          <p className="login-footnote">
            <CheckCircle2 size={16} />
            We never share your number with anyone.
          </p>

          {error ? <p className="login-error">{error}</p> : null}
        </section>

        <div className="login-copy-content login-copy-content--mobile">
          <h1>
            Your journeys, all in <span>one place</span>
          </h1>
          <p>
            Secure login to access your personalized itineraries, plans, and
            travel memories.
          </p>

          <div className="login-copy-points">
            <div>
              <Sparkles size={22} />
              <div>
                <strong>Smart & Personalized</strong>
                <span>Itineraries tailored just for you</span>
              </div>
            </div>
            <div>
              <Globe2 size={22} />
              <div>
                <strong>Instant Itinerary Access</strong>
                <span>All your trips, anytime, anywhere</span>
              </div>
            </div>
            <div>
              <ShieldCheck size={22} />
              <div>
                <strong>Secure & Seamless</strong>
                <span>Your data is safe with us</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-copy-pane">
        <div className="login-copy-brand">
          <img src="/tt_logo.png" alt="Travel Tuner" />
          <span>
            <BadgeCheck size={16} />
            AI-Powered Travel Itinerary Planner
          </span>
        </div>

        <div className="login-copy-content">
          <h1>
            Your journeys, all in <span>one place</span>
          </h1>
          <p>
            Secure login to access your personalized itineraries, plans, and
            travel memories.
          </p>

          <div className="login-copy-points">
            <div>
              <Sparkles size={22} />
              <div>
                <strong>Smart & Personalized</strong>
                <span>Itineraries tailored just for you</span>
              </div>
            </div>
            <div>
              <Globe2 size={22} />
              <div>
                <strong>Instant Itinerary Access</strong>
                <span>All your trips, anytime, anywhere</span>
              </div>
            </div>
            <div>
              <ShieldCheck size={22} />
              <div>
                <strong>Secure & Seamless</strong>
                <span>Your data is safe with us</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-card-pane">
        <Link href="/" className="login-back">
          <ArrowLeft size={16} />
          Back home
        </Link>

        <div className="login-card-title">
          <h2>
            Access your saved <span>itineraries</span>
          </h2>
        </div>

        <p className="login-card-copy">
          Use your mobile number to sign in and see every itinerary tied to your
          account.
        </p>

        <div className="login-field-group">
          <label>Mobile number</label>
          <div className="phone-field">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 15))
              }
              placeholder="98765 43210"
            />
          </div>
        </div>

        {step === 2 ? (
          <div className="login-field-group">
            <label>OTP</label>
            <input
              className="otp-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
            />
          </div>
        ) : null}

        <button
          className="login-primary-btn"
          type="button"
          onClick={step === 1 ? sendOtp : verifyOtp}
          disabled={loading || !digitsOnly}
        >
          {loading
            ? "Please wait..."
            : step === 1
              ? "Send OTP"
              : "Verify & Login"}
          <ArrowRight size={24} />
        </button>

        <p className="login-footnote">
          <CheckCircle2 size={16} />
          We never share your number with anyone.
        </p>

        {error ? <p className="login-error">{error}</p> : null}
      </section>
    </main>
  );
}
