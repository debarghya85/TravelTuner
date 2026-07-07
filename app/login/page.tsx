"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Globe2,
  UserRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { consumeLoginReturnPath } from "../../lib/login-redirect";

export default function LoginPage() {
  const returnPath = consumeLoginReturnPath() || "/itineraries";

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
            Sign in with your social account to keep your travel plans, saved
            trips, and profile in one place.
          </p>

          <Link
            className="login-social-btn login-google-btn"
            href={`/api/auth/start/google?returnTo=${encodeURIComponent(returnPath)}`}
          >
            <img
              src="/google-logo.svg"
              alt="Google"
              className="login-google-logo"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied === "1") return;
                event.currentTarget.dataset.fallbackApplied = "1";
                event.currentTarget.src = "/google-logo-fallback.svg";
              }}
            />
            <span className="login-social-text">Google</span>
          </Link>

          <p className="login-footnote">
            <ShieldCheck size={16} />
            We only store your basic profile details from the provider you
            choose.
          </p>
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
          Sign in with your social account to keep your travel plans, saved
          trips, and profile in one place.
        </p>

        <Link
          className="login-social-btn login-google-btn"
          href={`/api/auth/start/google?returnTo=${encodeURIComponent(returnPath)}`}
        >
          <img
            src="/google-logo.svg"
            alt="Google"
            className="login-google-logo"
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === "1") return;
              event.currentTarget.dataset.fallbackApplied = "1";
              event.currentTarget.src = "/google-logo-fallback.svg";
            }}
          />
          <span className="login-social-text">Google</span>
        </Link>

        <p className="login-footnote">
          <ShieldCheck size={16} />
          We only store your basic profile details from the provider you choose.
        </p>
      </section>
    </main>
  );
}
