"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CreditCard,
  FileText,
  Home,
  Info,
  Laptop,
  LockKeyhole,
  MonitorSmartphone,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

type PaymentOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  planId: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string | null;
  refundId?: string | null;
  refundStatus?: string | null;
  refundProcessedAt?: string | null;
};

type Variant =
  | "plan"
  | "razorpay"
  | "success"
  | "verifying"
  | "generating"
  | "ready"
  | "failed"
  | "ai-failed"
  | "refund"
  | "details";

const planCopy: Record<
  string,
  { title: string; tagline: string; perks: string[]; tone: string }
> = {
  "view-only": {
    title: "View Only Plan",
    tagline:
      "Get your AI-generated itinerary instantly. Perfect if you only want to view your trip.",
    perks: [
      "Generate itinerary",
      "View itinerary online",
      "Download PDF",
      "Share itinerary",
      "Export itinerary",
    ],
    tone: "bronze",
  },
  premium: {
    title: "Premium Plan",
    tagline:
      "Everything unlocked for travelers who want export, sharing, and editing tools.",
    perks: [
      "Generate itinerary",
      "View itinerary",
      "Download PDF",
      "Share itinerary",
      "Export itinerary",
    ],
    tone: "gold",
  },
};

function moneyLabel(amount: number, currency = "INR") {
  const rupees = (amount || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

function Header({
  backHref,
  closeHref,
}: {
  backHref?: string;
  closeHref?: string;
}) {
  const router = useRouter();
  return (
    <header className="checkout-header">
      {backHref ? (
        <button
          type="button"
          className="checkout-icon-btn checkout-back-btn"
          onClick={() => router.push(backHref)}
        >
          <ArrowLeft size={17} />
          <span>Back</span>
        </button>
      ) : (
        <div className="checkout-back-spacer" />
      )}

      <div className="checkout-brand">
        <img src="/tt_logo.png" alt="Travel Tuner" />
        <span>SECURE CHECKOUT</span>
      </div>

      {closeHref ? (
        <Link
          href={closeHref}
          className="checkout-icon-btn checkout-close-btn"
          aria-label="Close"
        >
          <X size={17} />
        </Link>
      ) : (
        <div className="checkout-back-spacer" />
      )}
    </header>
  );
}

function FooterTrust() {
  return (
    <div className="checkout-footer-trust">
      <span>
        <ShieldCheck size={14} /> Safe & Secure Payments
      </span>
      <span>
        <ShieldCheck size={14} /> PCI DSS Compliant
      </span>
      <span>
        <LockKeyhole size={14} /> 256-bit SSL Encrypted
      </span>
    </div>
  );
}

function OrderSummary({
  order,
  plan,
}: {
  order: PaymentOrder | null;
  plan: { title: string };
}) {
  const featuredCount = plan.title === "View Only Plan" ? 2 : 5;
  return (
    <div className="checkout-card">
      <h3>
        <CreditCard size={16} /> Order Summary
      </h3>
      <div className="summary-lines">
        <div>
          <span>Plan</span>
          <strong>{plan.title}</strong>
        </div>
        <div>
          <span>Price</span>
          <strong>
            {moneyLabel(order?.amount || 9, order?.currency || "INR")}
          </strong>
        </div>
        <div>
          <span>Taxes</span>
          <strong>Included</strong>
        </div>
      </div>
      <div className="summary-total">
        <span>Total Amount</span>
        <strong>
          {moneyLabel(order?.amount || 9, order?.currency || "INR")}
        </strong>
      </div>
    </div>
  );
}

function SecurePaymentCard({ orderId }: { orderId?: string | null }) {
  const router = useRouter();
  const nextRoute = `/payment/${orderId || "demo"}/razorpay`;
  return (
    <div className="checkout-card secure-payment-card">
      <h3>
        <LockKeyhole size={16} /> Secure Payment
      </h3>
      <p>Your payment is safe and encrypted.</p>
      <div className="payment-method-grid">
        <button type="button" onClick={() => router.push(nextRoute)}>
          <CreditCard size={20} />
          <span>UPI</span>
        </button>
        <button type="button" onClick={() => router.push(nextRoute)}>
          <CreditCard size={20} />
          <span>Cards</span>
        </button>
        <button type="button" onClick={() => router.push(nextRoute)}>
          <Home size={20} />
          <span>Net Banking</span>
        </button>
        <button type="button" onClick={() => router.push(nextRoute)}>
          <Wallet size={20} />
          <span>Wallets</span>
        </button>
      </div>
      <div className="powered-row">
        <span>Powered by</span>
        <strong>Razorpay</strong>
      </div>
      <button
        type="button"
        className="cta-primary checkout-primary-button"
        onClick={() => router.push(nextRoute)}
      >
        Pay ₹9 & Generate Itinerary
      </button>
      <div className="tiny-points">
        <span>
          <CheckCircle2 size={14} /> 100% Secure
        </span>
        <span>
          <CheckCircle2 size={14} /> No hidden charges
        </span>
        <span>
          <CheckCircle2 size={14} /> Instant access
        </span>
      </div>
    </div>
  );
}

function PlanHero({
  plan,
  amount,
}: {
  plan: { title: string; tagline: string; perks: string[]; tone: string };
  amount: string;
}) {
  const featuredCount = plan.title === "View Only Plan" ? 2 : 5;
  return (
    <section className={`plan-hero plan-tone-${plan.tone}`}>
      <div className="kicker">
        <Sparkles size={14} /> Quick Access
      </div>
      <h1>{plan.title}</h1>
      <p>{plan.tagline}</p>
      <div className="hero-price">{amount}</div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art-shell">
          <FileText size={56} strokeWidth={2.4} />
        </div>
      </div>
      <div className="what-you-get">
        <div>
          <strong>What you get</strong>
          {plan.perks.slice(0, featuredCount).map((item) => (
            <span key={item}>
              <Check size={13} /> {item}
            </span>
          ))}
        </div>
        <div>
          {plan.perks.slice(featuredCount).map((item) => (
            <span key={item} className="muted-item">
              <X size={12} /> {item}
            </span>
          ))}
        </div>
      </div>
      <div className="plan-badges">
        <span>
          <MonitorSmartphone size={14} /> AI starts only after payment
        </span>
        <span>
          <ShieldCheck size={14} /> Secure Razorpay checkout
        </span>
        <span>
          <RotateCcw size={14} /> Refund if AI generation fails
        </span>
      </div>
      {plan.title === "View Only Plan" ? (
        <div className="premium-banner">
          <strong>Need more features?</strong>
          <p>
            Upgrade to Premium anytime and unlock downloads, sharing and more.
          </p>
          <button type="button" className="outline-primary">
            View Premium Plan <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function PaymentPlanDesktop({
  order,
  plan,
}: {
  order: PaymentOrder | null;
  plan: { title: string; tagline: string; perks: string[]; tone: string };
}) {
  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <Header backHref="/generate-itinerary" />
        <div className="checkout-desktop-grid">
          <PlanHero
            plan={plan}
            amount={moneyLabel(order?.amount || 9, order?.currency || "INR")}
          />
          <div className="checkout-side-column">
            <OrderSummary order={order} plan={plan} />
            <SecurePaymentCard orderId={order?.id} />
          </div>
        </div>
        <div className="checkout-bottom-icons">
          <span>
            <ShieldCheck size={15} /> 100% Secure
          </span>
          <span>
            <QrCode size={15} /> Instant Access
          </span>
          <span>
            <Sparkles size={15} /> Trusted by 1000+ users
          </span>
        </div>
      </div>
    </main>
  );
}

function RazorpayCheckout({ order }: { order: PaymentOrder | null }) {
  const orderHref = `/payment/${order?.id || "demo"}`;
  return (
    <main className="popup-page">
      <div className="popup-frame checkout-modal">
        <Header closeHref={orderHref} />
        <div className="checkout-modal-grid">
          <aside className="checkout-methods">
            <h2>Choose a payment method</h2>
            <button className="method-card active" type="button">
              <Smartphone size={18} />
              <span>
                <strong>UPI</strong>
                <small>Pay using UPI apps</small>
              </span>
            </button>
            <button className="method-card" type="button">
              <CreditCard size={18} />
              <span>
                <strong>Cards</strong>
                <small>Visa, Mastercard, RuPay</small>
              </span>
            </button>
            <button className="method-card" type="button">
              <Home size={18} />
              <span>
                <strong>Net Banking</strong>
                <small>All major banks</small>
              </span>
            </button>
            <button className="method-card" type="button">
              <Wallet size={18} />
              <span>
                <strong>Wallets</strong>
                <small>Paytm, PhonePe, etc.</small>
              </span>
            </button>
            <button className="method-card" type="button">
              <Laptop size={18} />
              <span>
                <strong>Other UPI Apps</strong>
                <small>Google Pay, BHIM, etc.</small>
              </span>
            </button>
          </aside>
          <section className="upi-panel">
            <div className="upi-top-row">
              <strong>Pay using UPI</strong>
              <div className="upi-logos">G Pay paytm</div>
            </div>
            <p>Scan QR code with any UPI app</p>
            <div className="qr-box">
              <div className="qr-placeholder">QR</div>
            </div>
            <div className="or-divider">or</div>
            <label className="upi-input">
              <span>Enter UPI ID</span>
              <input placeholder="name@upi" />
            </label>
            <div className="upi-actions">
              <button className="cta-primary" type="button">
                Pay Now
              </button>
            </div>
            <div className="powered-row center">
              Secured by <strong>Razorpay</strong>
            </div>
          </section>
        </div>
        <FooterTrust />
      </div>
    </main>
  );
}

function SuccessScreen({ order }: { order: PaymentOrder | null }) {
  const orderHref = `/payment/${order?.id || "demo"}`;
  return (
    <main className="popup-page">
      <div className="popup-frame success-panel">
        <Header closeHref={orderHref} />
        <div className="success-icon">
          <CheckCircle2 size={78} />
        </div>
        <h2>Payment Successful!</h2>
        <p className="success-amount">
          {moneyLabel(order?.amount || 9, order?.currency || "INR")} Paid
          Successfully
        </p>
        <p>
          Thank you! Your payment has been received. We are now verifying your
          payment.
        </p>
        <div className="info-table">
          <div>
            <span>Payment ID</span>
            <strong>
              {order?.gatewayPaymentId || `pay_${order?.id || "demo"}`}
            </strong>
          </div>
          <div>
            <span>Order ID</span>
            <strong>
              {order?.gatewayOrderId || `order_${order?.id || "demo"}`}
            </strong>
          </div>
          <div>
            <span>Amount</span>
            <strong>
              {moneyLabel(order?.amount || 9, order?.currency || "INR")}
            </strong>
          </div>
          <div>
            <span>Method</span>
            <strong>UPI</strong>
          </div>
        </div>
        <div className="notice-box">
          This window will close automatically. You will be redirected in a
          moment.
        </div>
      </div>
    </main>
  );
}

function TerminalScreen({
  title,
  body,
  ctaPrimary,
  ctaSecondary,
}: {
  title: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary?: string;
}) {
  return (
    <main className="popup-page">
      <div className="popup-frame terminal-panel">
        <Header closeHref="/generate-itinerary" />
        <div className="terminal-icon">
          <CircleAlert size={60} />
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="terminal-box">
          <strong>Reason</strong>
          <span>
            {body.toLowerCase().includes("refund")
              ? "Refund will be processed automatically"
              : "Payment cancelled or failed"}
          </span>
        </div>
        <div className="terminal-actions">
          <button className="cta-secondary" type="button">
            {ctaPrimary}
          </button>
          {ctaSecondary ? (
            <button className="cta-primary" type="button">
              {ctaSecondary}
            </button>
          ) : null}
        </div>
        <div className="notice-box small">
          If amount was deducted, it will be refunded automatically within 5-7
          business days.
        </div>
      </div>
    </main>
  );
}

function TrackingInfo({ order }: { order: PaymentOrder | null }) {
  return (
    <div className="info-table">
      <div>
        <span>Order ID</span>
        <strong>{order?.gatewayOrderId || `order_${order?.id || "demo"}`}</strong>
      </div>
      <div>
        <span>Payment ID</span>
        <strong>{order?.gatewayPaymentId || `pay_${order?.id || "demo"}`}</strong>
      </div>
      <div>
        <span>Refund ID</span>
        <strong>{order?.refundId || "Processing..."}</strong>
      </div>
      <div>
        <span>Refund Status</span>
        <strong className={order?.refundStatus === "processed" ? "status-success" : ""}>
          {order?.refundStatus || "pending"}
        </strong>
      </div>
    </div>
  );
}

function ReadyScreen({ order }: { order: PaymentOrder | null }) {
  return (
    <main className="popup-page">
      <div className="popup-frame ready-panel">
        <Header closeHref={`/payment/${order?.id || "demo"}`} />
        <div className="ready-hero">
          <div className="ready-book">🗺️</div>
          <div>
            <h2>Your Itinerary is Ready!</h2>
            <p>Your trip has been created successfully.</p>
          </div>
        </div>
        <div className="ready-meta">
          <div>
            <CheckCircle2 size={15} /> <span>Payment</span>
            <strong>
              {moneyLabel(order?.amount || 9, order?.currency || "INR")}
            </strong>
          </div>
          <div>
            <CheckCircle2 size={15} /> <span>Itinerary Type</span>
            <strong>View Only</strong>
          </div>
          <div>
            <CheckCircle2 size={15} /> <span>Access</span>
            <strong>Now</strong>
          </div>
        </div>
        <button
          className="cta-primary large"
          type="button"
          onClick={() => window.location.assign("/result")}
        >
          View My Itinerary
        </button>
        <p className="ready-note">
          You can always access it from <strong>My Trips</strong>.
        </p>
      </div>
    </main>
  );
}

function DetailsPage({ order }: { order: PaymentOrder | null }) {
  return (
    <main className="checkout-page details-page">
      <div className="checkout-shell details-shell">
        <Header backHref={`/payment/${order?.id || "demo"}`} />
        <div className="details-grid">
          <section className="details-card">
            <h3>Order Information</h3>
            <div className="detail-lines">
              <div>
                <span>Order ID</span>
                <strong>
                  {order?.gatewayOrderId || `order_${order?.id || "demo"}`}
                </strong>
              </div>
              <div>
                <span>Date</span>
                <strong>08 May 2024, 11:30 AM</strong>
              </div>
              <div>
                <span>Plan</span>
                <strong>View Only</strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>
                  {moneyLabel(order?.amount || 9, order?.currency || "INR")}
                </strong>
              </div>
            </div>
          </section>
          <section className="details-card">
            <h3>Payment Information</h3>
            <div className="detail-lines">
              <div>
                <span>Payment ID</span>
                <strong>
                  {order?.gatewayPaymentId || `pay_${order?.id || "demo"}`}
                </strong>
              </div>
              <div>
                <span>Status</span>
                <strong className="status-success">Success</strong>
              </div>
              <div>
                <span>Method</span>
                <strong>UPI</strong>
              </div>
              <div>
                <span>UPI ID</span>
                <strong>rahul@upi</strong>
              </div>
              <div>
                <span>Paid On</span>
                <strong>08 May 2024, 11:31 AM</strong>
              </div>
            </div>
          </section>
          <aside className="details-card details-actions">
            <h3>What you can do</h3>
            {[
              "View Itinerary",
              "Go to My Trips",
              "Download Invoice",
              "Need Help?",
            ].map((item) => (
              <button key={item} className="details-action" type="button">
                <span>
                  <Info size={14} /> {item}
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </aside>
        </div>
        <div className="details-note">
          Thank you for your purchase! You can always find your itinerary in My
          Trips.
        </div>
      </div>
    </main>
  );
}

function RefundScreen({ order }: { order: PaymentOrder | null }) {
  return (
    <main className="popup-page">
      <div className="popup-frame success-panel">
        <Header closeHref={`/payment/${order?.id || "demo"}`} />
        <div className="success-icon">
          <CheckCircle2 size={78} />
        </div>
        <h2>Refund Requested</h2>
        <p className="success-amount">
          {moneyLabel(order?.amount || 9, order?.currency || "INR")} refund is in progress
        </p>
        <p>
          We have initiated the refund and sent it to Razorpay for processing.
        </p>
        <TrackingInfo order={order} />
        <div className="notice-box">
          Keep these ids for support tracking. Refunds usually reflect in 5-7 business days.
        </div>
      </div>
    </main>
  );
}

export function PaymentFlow({
  variant,
  order,
}: {
  variant: Variant;
  order: PaymentOrder | null;
}) {
  const plan = useMemo(
    () => planCopy[order?.planId || "view-only"],
    [order?.planId],
  );
  if (variant === "razorpay") return <RazorpayCheckout order={order} />;
  if (variant === "success") return <SuccessScreen order={order} />;
  if (variant === "verifying")
    return (
      <TerminalScreen
        title="Verifying Payment..."
        body="Please wait while we confirm your payment."
        ctaPrimary="Please do not close this window."
      />
    );
  if (variant === "generating")
    return (
      <TerminalScreen
        title="Generating Your Itinerary..."
        body="Our AI is crafting the perfect trip for you."
        ctaPrimary="Please do not close this window."
      />
    );
  if (variant === "ready") return <ReadyScreen order={order} />;
  if (variant === "failed")
    return (
      <TerminalScreen
        title="Payment Failed"
        body="We couldn't complete your payment. Please try again."
        ctaPrimary="Try Again"
        ctaSecondary="Change Payment Method"
      />
    );
  if (variant === "ai-failed")
    return (
      <TerminalScreen
        title="Unable to Generate Itinerary"
        body="We're sorry, but we couldn't generate your itinerary due to a temporary issue."
        ctaPrimary="Go to My Trips"
        ctaSecondary="Contact Support"
      />
    );
  if (variant === "refund")
    return <RefundScreen order={order} />;
  if (variant === "details") return <DetailsPage order={order} />;
  return <PaymentPlanDesktop order={order} plan={plan} />;
}
