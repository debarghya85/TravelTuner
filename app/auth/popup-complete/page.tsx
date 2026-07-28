"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthPopupCompletePage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") || "/generate-itinerary";

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "travel-tuner-auth-success", next },
          window.location.origin,
        );
      }
    } finally {
      window.close();
    }
  }, [searchParams]);

  return (
    <main className="login-shell scenic-shell">
      <section className="login-card-pane login-card-pane--mobile">
        <p className="login-card-copy">Completing sign-in...</p>
      </section>
    </main>
  );
}
