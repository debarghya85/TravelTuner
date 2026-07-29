"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function AuthPopupCompleteContent() {
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

export default function AuthPopupCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="login-shell scenic-shell">
          <section className="login-card-pane login-card-pane--mobile">
            <p className="login-card-copy">Completing sign-in...</p>
          </section>
        </main>
      }
    >
      <AuthPopupCompleteContent />
    </Suspense>
  );
}
