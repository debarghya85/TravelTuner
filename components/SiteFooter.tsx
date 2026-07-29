"use client";

import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
};

type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

type SiteFooterProps = {
  description?: string;
  copyright?: string;
  groups?: FooterLinkGroup[];
};

const defaultGroups: FooterLinkGroup[] = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Sample Itineraries", href: "/sample-itineraries" },
      { label: "Pricing", href: "/#pricing-faq-grid" },
      { label: "FAQs", href: "/#pricing-faq-grid" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", text: "f", href: "https://facebook.com" },
  { label: "Instagram", text: "ig", href: "https://instagram.com" },
  { label: "YouTube", text: "yt", href: "https://youtube.com" },
  { label: "Twitter", text: "x", href: "https://x.com" },
];

const trustItems = [
  { icon: LockKeyhole, text: "Secure Payment", accent: "amber" },
  { icon: ShieldCheck, text: "Razorpay Secured", accent: "blue" },
  { icon: ShieldCheck, text: "100% Safe", accent: "green" },
  { icon: MessageCircle, text: "Made with ❤️ for travelers", accent: "rose" },
];

export function SiteFooter({
  description = "AI-powered travel planning in minutes. Personalized itineraries, accurate budgets, and unforgettable journeys.",
  copyright = "© 2026 Travel Tuner. All rights reserved.",
  groups = defaultGroups,
}: SiteFooterProps) {
  return (
    <footer className="sample-mockup-footer">
      <div className="sample-mockup-footer-shell">
        <div className="sample-mockup-footer-top">
          <div className="sample-mockup-footer-brand">
            <Image
              src="/tt_logo.png"
              alt="Travel Tuner"
              width={240}
              height={78}
            />
            <p>{description}</p>
          </div>

          {groups.map((group) => (
            <div key={group.title} className="sample-mockup-footer-links">
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sample-mockup-footer-art" aria-hidden="true">
            <Image
              src="/itinerary_leftpanel.png"
              alt=""
              width={280}
              height={210}
              priority={false}
            />
          </div>
        </div>

        <div className="sample-mockup-footer-bottom">
          <span className="sample-mockup-footer-copyright">{copyright}</span>
          {trustItems.map(({ icon: Icon, text, accent }) => (
            <span key={text} className="sample-mockup-footer-trust">
              <span className={`sample-mockup-footer-badge ${accent}`}>
                <Icon size={16} />
              </span>
              <span>{text}</span>
            </span>
          ))}
        </div>

        {/* <div className="sample-mockup-footer-copyright">{copyright}</div> */}
      </div>
    </footer>
  );
}
