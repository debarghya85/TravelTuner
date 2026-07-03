"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlaneTakeoff, Hotel, Utensils, MapPinned } from "lucide-react";
import { saveItinerary } from "../../result/itinerary-data";

const JOB_KEY = "travel-tuner:last-job-id";

const steps = [
  "Reading your trip brief",
  "Finding the best route and stay options",
  "Calling AI for your itinerary",
  "Polishing your day-by-day plan",
  "Saving your results",
];

const icons = [PlaneTakeoff, MapPinned, Hotel, Utensils, Sparkles];

export default function LoadingItineraryPage() {
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const stageText = useMemo(() => steps[stageIndex] || steps[0], [stageIndex]);

  useEffect(() => {
    const jobId = window.sessionStorage.getItem(JOB_KEY);

    if (!jobId) {
      router.replace("/generate-itinerary");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/itinerary-jobs/${jobId}`);
        if (!response.ok) {
          throw new Error("Unable to read job status");
        }

        const data = await response.json();
        const job = data.job;

        if (cancelled) return;

        const statusProgress: Record<string, number> = {
          queued: 15,
          processing: 52,
          saving: 82,
          done: 100,
          failed: 100,
        };

        if (job?.status) {
          setProgress((current) => Math.max(current, statusProgress[job.status] || 60));
        }

        if (job?.stage) {
          const index = steps.findIndex((item) =>
            item.toLowerCase().includes(String(job.stage).toLowerCase()),
          );
          if (index >= 0) {
            setStageIndex((current) => Math.max(current, index));
          }
        }

        if (job?.status === "done" && job?.output) {
          saveItinerary({ success: true, itinerary: job.output });
          window.sessionStorage.removeItem(JOB_KEY);
          router.replace("/result");
          return;
        }

        if (job?.status === "failed") {
          window.sessionStorage.removeItem(JOB_KEY);
          router.replace("/generate-itinerary");
          return;
        }
      } catch (error) {
        console.error(error);
      }
    };

    poll();
    const interval = window.setInterval(poll, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [router]);

  const Icon = icons[stageIndex % icons.length];

  return (
    <main className="itinerary-loading-screen">
      <div className="itinerary-loading-glow" />
      <section className="itinerary-loading-card">
        <div className="itinerary-loading-badge">
          <Icon size={22} />
          <span>Crafting your journey</span>
        </div>
        <h1>Building a trip that feels personal</h1>
        <p>{stageText}</p>
        <div className="itinerary-loading-track" aria-hidden="true">
          <div
            className="itinerary-loading-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="itinerary-loading-meta">
          <span>Personalized planning</span>
          <span>{progress}%</span>
        </div>
        <div className="itinerary-loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
