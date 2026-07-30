"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  LogOut,
  ChevronRight,
  TicketCheck,
  Home,
  CircleHelp,
  MapPinned,
} from "lucide-react";

type AuthUser = {
  id: string;
  provider?: "google" | "facebook" | "email" | "unknown";
  providerId?: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
} | null;

type SiteHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

function UserAvatar({
  src,
  alt,
  className,
  fallbackClassName = "nav-avatar-fallback",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const imageSrc = src || "/default-avatar.svg";
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="eager"
      decoding="async"
      onError={(event) => {
        const target = event.currentTarget;
        if (target.dataset.fallbackApplied === "1") return;
        target.dataset.fallbackApplied = "1";
        target.src = "/default-avatar.svg";
        target.className = className
          ? `${className} ${fallbackClassName}`
          : fallbackClassName;
      }}
    />
  );
}

export function SiteHeader({ backHref, backLabel = "Back" }: SiteHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) return;
      const data = await response.json();
      setUser(data.user || null);
    };

    loadUser();
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/start/google?returnTo=%2F";
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      return;
    }
    setUser(null);
    setMenuOpen(false);
    router.replace("/");
    router.refresh();
  };

  return (
    <header className="sample-mockup-topbar">
      <div>
        {backHref ? (
          <Link href={backHref} className="sample-mockup-back">
            <ChevronLeft size={18} />
            <span className="sample-mockup-back-label">{backLabel}</span>
          </Link>
        ) : null}
      </div>

      <div className="sample-mockup-brand">
        <img
          src="/tt_logo.png"
          alt="Travel Tuner"
          className="sample-mockup-logo"
        />
      </div>

      <div className="sample-mockup-auth" ref={menuRef}>
        {user ? (
          <div className="sample-mockup-profile-wrap">
            <button
              type="button"
              className="sample-mockup-user"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="sample-mockup-avatar">
                <UserAvatar
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="nav-avatar-img"
                />
              </span>

              <span id="username">
                {user.displayName || user.email || "Traveler"}
              </span>

              <ChevronDown
                size={16}
                className={
                  menuOpen ? "profile-chevron open" : "profile-chevron"
                }
              />
            </button>

            {menuOpen && (
              <div
                className="nav-profile-menu sample-mockup-user-menu"
                role="menu"
              >
                <div className="sample-profile-menu-user">
                  <span className="sample-profile-menu-avatar">
                    <UserAvatar
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="sample-profile-menu-avatar-img"
                    />
                  </span>

                  <div className="sample-profile-menu-user-copy">
                    <strong>
                      {user.displayName || user.email || "Traveler"}
                    </strong>

                    <span>
                      {user.provider === "unknown"
                        ? "Logged in"
                        : `Logged in with ${user.provider}`}
                    </span>
                  </div>
                </div>

                <nav className="sample-profile-menu-links">
                  <Link href="/" role="menuitem">
                    <span className="sample-profile-menu-icon">
                      <Home size={18} />
                    </span>
                    <span>Home</span>
                    <ChevronRight size={17} />
                  </Link>
                  <Link href="/sample-itineraries" role="menuitem">
                    <span className="sample-profile-menu-icon">
                      <TicketCheck size={18} />
                    </span>
                    <span>Sample Itineraries</span>
                    <ChevronRight size={17} />
                  </Link>

                  <Link href="/#faq-stack" role="menuitem">
                    <span className="sample-profile-menu-icon">
                      <CircleHelp size={18} />
                    </span>
                    <span>FAQs</span>
                    <ChevronRight size={17} />
                  </Link>
                  <Link href="/itineraries" role="menuitem">
                    <span className="sample-profile-menu-icon">
                      <MapPinned size={18} />
                    </span>
                    <span>My Travel Plans</span>
                    <ChevronRight size={17} />
                  </Link>
                </nav>

                <button
                  type="button"
                  className="sample-profile-menu-logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className="sample-profile-menu-logout-icon">
                    <LogOut size={18} />
                  </span>

                  <span>
                    <strong>Logout</strong>
                    <small>Sign out from Travel Tuner</small>
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="gsi-material-button header-google-login"
            onClick={handleLogin}
          >
            <div className="gsi-material-button-state" />
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon" aria-hidden="true">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in</span>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}
