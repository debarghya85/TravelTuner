"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MessageCircle,
  Clock3,
  PlaneTakeoff,
  Headset,
  UserRound,
  Heart,
  Sparkles,
  Send,
  SquarePen,
  MailOpen,
  PhoneCall,
  Star,
  Wallet,
} from "lucide-react";
import { SiteFooter } from "../../components/SiteFooter";

const supportTiles = [
  { icon: Headset, title: "Quick Support" },
  { icon: UserRound, title: "Friendly Team" },
  { icon: Heart, title: "We Care" },
];

const helpFacts = [
  { icon: SquarePen, title: "Personalized", text: "Itineraries" },
  { icon: Wallet, title: "Budget", text: "Friendly" },
  { icon: Clock3, title: "Save Time", text: "& Effort" },
  { icon: Star, title: "Trusted by", text: "Travelers" },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <header className="contact-topbar">
        <Link href="/" className="contact-brand" aria-label="Travel Tuner home">
          <img src="/tt_logo.png" alt="Travel Tuner" />
        </Link>

        <nav className="contact-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/sample-itineraries">Sample Itineraries</Link>
          <Link href="/#pricing-faq-grid">Plans</Link>
          <Link href="/contact" className="active" aria-current="page">
            Contact Us
          </Link>
        </nav>

        <Link href="/generate-itinerary" className="contact-cta-top">
          Get Started <ArrowUpRight size={18} />
        </Link>
      </header>

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="contact-kicker">We&apos;re Here For You!</p>
          <h1>Let&apos;s Plan Your</h1>
          <h2>Perfect Journey</h2>
          <p className="contact-description">
            Have questions, feedback, or need help planning your trip? Our team
            is just a message away.
          </p>

          <div className="contact-support-row" aria-label="Support highlights">
            {supportTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <div className="contact-support-tile" key={tile.title}>
                  <span className="contact-support-icon" aria-hidden="true">
                    <Icon size={42} strokeWidth={1.8} />
                  </span>
                  <strong>{tile.title}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="contact-hero-art" aria-hidden="true">
          <div className="contact-hero-sky" />
          <div className="contact-hero-sun" />
          <div className="contact-hero-cloud contact-cloud-a" />
          <div className="contact-hero-cloud contact-cloud-b" />
          <div className="contact-hero-mountains" />
          <div className="contact-hero-water" />
          <div className="contact-hero-pier" />
          <div className="contact-hero-figure">
            <div className="contact-hero-hat" />
            <div className="contact-hero-shoulders" />
            <div className="contact-hero-bag" />
          </div>
          <div className="contact-hero-village">
            <span className="domes dome-one" />
            <span className="domes dome-two" />
            <span className="domes dome-three" />
            <span className="domes dome-four" />
          </div>
        </div>
      </section>

      <section className="contact-message-panel">
        <div className="contact-message-card">
          <div className="contact-message-head">
            <PlaneTakeoff size={30} />
            <div>
              <h3>Send Us a Message</h3>
              <p>Fill out the form and we&apos;ll get back to you soon.</p>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              const subject = encodeURIComponent("Travel Tuner Contact Request");
              const body = encodeURIComponent(
                "Hi Travel Tuner,\n\nI need help with my trip planning.\n\nThanks,"
              );
              window.location.href = `mailto:traveltuner.85@gmail.com?subject=${subject}&body=${body}`;
            }}
          >
            <div className="contact-field-row">
              <label>
                <span>
                  <UserRound size={18} />
                  Your Name
                </span>
                <input type="text" placeholder="Your Name" />
              </label>
              <label>
                <span>
                  <Mail size={18} />
                  Your Email
                </span>
                <input type="email" placeholder="Your Email" />
              </label>
            </div>

            <label>
              <span>
                <Phone size={18} />
                Phone Number (Optional)
              </span>
              <input type="tel" placeholder="Phone Number (Optional)" />
            </label>

            <label>
              <span>
                <Sparkles size={18} />
                Subject
              </span>
              <input type="text" placeholder="Subject" />
            </label>

            <label className="contact-message-field">
              <span>
                <MessageCircle size={18} />
                Your Message
              </span>
              <textarea rows={6} placeholder="Your Message" />
            </label>

            <button type="submit" className="contact-submit">
              <Send size={18} />
              Send Message
            </button>
            <div className="contact-safe-note">
              <MailOpen size={14} />
              Your information is safe with us.
            </div>
          </form>
        </div>

        <aside className="contact-info-card">
          <h3>Other Ways to Reach Us</h3>
          <div className="contact-title-rule" />

          <div className="contact-info-list">
            <div className="contact-info-item">
              <span className="contact-info-icon">
                <Mail size={20} />
              </span>
              <div>
                <strong>Email Us</strong>
                <p>traveltuner.85@gmail.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">
                <PhoneCall size={20} />
              </span>
              <div>
                <strong>Call Us</strong>
                <p>+91 98745 67890</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span className="contact-info-icon">
                <MessageCircle size={20} />
              </span>
              <div>
                <strong>WhatsApp</strong>
                <p>+91 98745 67890</p>
              </div>
            </div>

            <div className="contact-info-item contact-hours">
              <span className="contact-info-icon">
                <Clock3 size={20} />
              </span>
              <div>
                <strong>Business Hours</strong>
                <p>Mon - Sat : 9:00 AM - 8:00 PM</p>
                <p>Sun : 10:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="contact-info-item contact-socials">
              <span className="contact-info-icon">
                <Star size={20} />
              </span>
              <div>
                <strong>Follow Us</strong>
              <div className="contact-social-row">
                  <span>ig</span>
                  <span>f</span>
                  <span>yt</span>
                  <span>x</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="contact-help-panel">
        <div className="contact-help-art" aria-hidden="true">
          <div className="contact-help-leftscape" />
          <div className="contact-help-suitcase" />
          <div className="contact-help-camera" />
          <div className="contact-help-hat" />
          <div className="contact-help-map" />
        </div>

        <div className="contact-help-copy">
          <h3>Still Need Help Planning?</h3>
          <div className="contact-title-rule" />
          <p>Our AI Travel Planner is here to make your trip easier!</p>

          <div className="contact-help-grid">
            {helpFacts.map((item) => {
              const Icon = item.icon;
              return (
                <div className="contact-help-item" key={item.title}>
                  <span className="contact-help-icon" aria-hidden="true">
                    <Icon size={26} strokeWidth={1.8} />
                  </span>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          <Link href="/generate-itinerary" className="contact-help-btn">
            Plan My Trip <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
