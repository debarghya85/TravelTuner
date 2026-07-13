"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BellRing,
  Camera,
  Hotel,
  MapPinned,
  PlaneTakeoff,
  Sparkles,
  Star,
  Utensils,
  UserRound,
} from "lucide-react";
import { saveItinerary } from "../result/itinerary-data";

const JOB_KEY = "travel-tuner:last-job-id";

const steps = [
  "Reading your trip brief",
  "Finding the best route and stay options",
  "Calling AI for your itinerary",
  "Polishing your day-by-day plan",
  "Saving your results",
];

const icons = [PlaneTakeoff, MapPinned, Hotel, Utensils, Sparkles];

const milestones = [
  "Understanding\nyour preferences",
  "Finding best\nroutes & stays",
  "Curating top\nexperiences",
  "Optimizing your\nplan",
  "Finalizing your\nitinerary",
];

export default function ProgressPage() {
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(8);
  const [isTerminal, setIsTerminal] = useState(false);
  const redirectTimerRef = useRef<number | null>(null);
  const terminalRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);
  const progressRef = useRef(8);
  const kickoffRef = useRef(false);

  useEffect(() => {
    const jobId = window.sessionStorage.getItem(JOB_KEY);

    if (!jobId) {
      return;
    }

    let cancelled = false;
    let visualTimer = 0;

    terminalRef.current = false;
    progressRef.current = 8;
    kickoffRef.current = false;
    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    if (completionTimerRef.current) {
      window.clearInterval(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    const scheduleVisualTick = () => {
      const current = progressRef.current;
      const delay = current < 52 ? 1200 : current < 82 ? 650 : 450;
      visualTimer = window.setTimeout(() => {
        if (cancelled || terminalRef.current) return;
        setProgress((value) => {
          if (value >= 92) {
            return value;
          }

          const next = value + 1;
          progressRef.current = next;
          return next;
        });
        scheduleVisualTick();
      }, delay);
    };

    const kickoffProcessing = async () => {
      if (kickoffRef.current || terminalRef.current) {
        return;
      }

      kickoffRef.current = true;

      try {
        const response = await fetch(`/api/itinerary-jobs/${jobId}/process`, {
          method: "POST",
        });

        if (!response.ok && response.status !== 202) {
          console.warn("[jobs] failed to start itinerary processing", response.status);
        }
      } catch (error) {
        kickoffRef.current = false;
        console.error("[jobs] failed to start itinerary processing", error);
      }
    };

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
          pending: 27,
          processing: 48,
          completed: 100,
          failed: 100,
        };

        if (job?.status) {
          const terminal = job.status === "completed" || job.status === "failed";
          terminalRef.current = terminal;
          setIsTerminal(terminal);
          setProgress((current) =>
            Math.max(progressRef.current, statusProgress[job.status] || 60),
          );
          progressRef.current = Math.max(
            progressRef.current,
            statusProgress[job.status] || 60,
          );
        }

        if (job?.status === "pending") {
          void kickoffProcessing();
        }

        if (job?.stage) {
          const index = steps.findIndex((item) =>
            item.toLowerCase().includes(String(job.stage).toLowerCase()),
          );
          if (index >= 0) {
            setStageIndex((current) => Math.max(current, index));
          }
        }

        if (job?.status === "completed" && job?.output) {
          saveItinerary({
            success: true,
            planId: String((job as any)?.input?.planId || "silver"),
            itinerary: job.output,
            itineraryId: (job as any)?.output?.itineraryId || undefined,
          });
          window.sessionStorage.removeItem(JOB_KEY);
          terminalRef.current = true;
          setIsTerminal(true);
          if (visualTimer) {
            window.clearTimeout(visualTimer);
          }
          completionTimerRef.current = window.setInterval(() => {
            setProgress((current) => {
              if (current >= 100) {
                if (completionTimerRef.current) {
                  window.clearInterval(completionTimerRef.current);
                  completionTimerRef.current = null;
                }
                redirectTimerRef.current = window.setTimeout(() => {
                  router.replace("/result");
                }, 650);
                return 100;
              }

              return current + 1;
            });
            progressRef.current = Math.min(progressRef.current + 1, 100);
          }, 90);
          return;
        }

        if (job?.status === "failed") {
          const paymentOrderId = String(job?.paymentOrderId || "");
          if (paymentOrderId) {
            try {
              const paymentResponse = await fetch(`/api/payments/orders/${paymentOrderId}`);
              if (paymentResponse.ok) {
                const paymentData = await paymentResponse.json();
                const paymentOrder = paymentData?.order;
                if (paymentOrder?.status === "refunded") {
                  window.sessionStorage.removeItem(JOB_KEY);
                  router.replace(`/payment/${paymentOrderId}/refund`);
                  return;
                }
              }
            } catch (error) {
              console.error("[jobs] failed to read payment refund status", error);
            }
          }

          window.sessionStorage.removeItem(JOB_KEY);
          terminalRef.current = true;
          setIsTerminal(true);
          if (paymentOrderId) {
            router.replace(`/payment/${paymentOrderId}/ai-failed`);
          }
          return;
        }
      } catch (error) {
        console.error(error);
      }
    };

    poll();
    const interval = window.setInterval(poll, 2500);
    scheduleVisualTick();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(visualTimer);
      if (completionTimerRef.current) {
        window.clearInterval(completionTimerRef.current);
        completionTimerRef.current = null;
      }
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [router]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const Icon = icons[stageIndex % icons.length];
  const milestoneProgressIndex = Math.min(
    milestones.length - 1,
    Math.max(
      0,
      isTerminal && progress < 100
        ? milestones.length - 2
        : Math.round((progress / 100) * (milestones.length - 1)),
    ),
  );
  const isAlmostDone = progress >= 92 && progress < 100;
  const progressLabel =
    progress >= 90 ? "Completing soon! ✦" : "Almost there! ✦";

  return (
    <main className="itinerary-loading-screen">
      <div className="itinerary-loading-starfield" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="itinerary-loading-glow" aria-hidden="true" />

      <header className="itinerary-loading-header">
        <div className="itinerary-loading-brand">
          <img
            src="/tt_logo.png"
            alt="Travel Tuner"
            className="itinerary-loading-logo"
          />
        </div>
      </header>

      <section className="itinerary-loading-hero">
        <div className="itinerary-loading-copy">
          <h1>
            Building your perfect itinerary, <span>just for you</span>
          </h1>

          <div className="itinerary-loading-benefits" aria-hidden="true">
            <div>
              <div className="itinerary-loading-benefit-icon">
                <Sparkles size={18} />
              </div>
              <span>
                Analyzing your
                <br />
                preferences
              </span>
            </div>
            <div>
              <div className="itinerary-loading-benefit-icon">
                <MapPinned size={18} />
              </div>
              <span>
                Finding the
                <br />
                best routes
              </span>
            </div>
            <div>
              <div className="itinerary-loading-benefit-icon">
                <Camera size={18} />
              </div>
              <span>
                Curating
                <br />
                unique experiences
              </span>
            </div>
          </div>
        </div>

        <div className="itinerary-loading-world" aria-hidden="true">
          <div className="itinerary-loading-card-main">
            <div className="itinerary-loading-badge">
              <Icon size={18} />
              <span>AI is crafting your journey</span>
            </div>

            <div className="itinerary-loading-visual">
              <div className="itinerary-loading-orb">
                <span>AI</span>
              </div>
              <div className="itinerary-loading-copy-block">
                <h2>Generating your personalized itinerary...</h2>
                <p>This may take 20-60 seconds</p>
              </div>
              <div className="itinerary-loading-percent">
                <strong>{progress}%</strong>
                <span className={isAlmostDone ? "itinerary-loading-blink" : ""}>
                  {progressLabel}
                </span>
              </div>
            </div>

            <div className="itinerary-loading-track" aria-hidden="true">
              <div
                className="itinerary-loading-fill"
                style={{ width: `${progress}%`, "--progress": progress } as any}
              />
            </div>

            <div className="itinerary-loading-milestones" aria-hidden="true">
              {milestones.map((label, index) => (
                <div
                  key={label}
                  className={`itinerary-loading-milestone ${
                    index <= milestoneProgressIndex
                      ? "is-complete"
                      : index === stageIndex
                        ? "is-active"
                        : ""
                  }`}
                >
                  <span className="itinerary-loading-milestone-dot">
                    {index < 2 || progress >= 72 ? (
                      <BadgeCheck size={15} />
                    ) : index === 2 ? (
                      <Star size={15} />
                    ) : null}
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="itinerary-loading-tip">
            <BellRing size={18} />
            <p>
              Tip: Great trips are worth the wait! Our AI is working hard to
              make it <span>perfect for you</span>.
            </p>
            <Sparkles size={14} />
          </div>
        </div>
      </section>
    </main>
  );
}
