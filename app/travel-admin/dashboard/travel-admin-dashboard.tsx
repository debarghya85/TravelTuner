"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Eye,
  Home,
  LogOut,
  Sparkles,
  UserRound,
} from "lucide-react";

type RecordItem = {
  id: string;
  createdAt: string;
  createdAtMs?: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

type TripSummary = {
  source?: string;
  destination?: string;
  days?: string | number;
  budget?: string | number;
  travelStyle?: string;
  adults?: number;
  children?: number;
};

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return "-";
}

function formatPeople(adults?: number, children?: number) {
  return `${adults || 0} + ${children || 0}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="admin-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function RenderValue({ label, value }: { label: string; value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <details className="admin-collapse" open={false}>
        <summary>{label}</summary>
        <div className="admin-collapse-body">
          {value.length ? (
            value.map((entry, index) => (
              <div className="admin-item-card" key={`${label}-${index}`}>
                <div className="admin-item-title">
                  {toText(isObject(entry) ? entry.day : undefined) ||
                    `Item ${index + 1}`}
                </div>
                <div className="admin-item-grid">
                  {isObject(entry) ? (
                    Object.entries(entry).map(([entryKey, entryValue]) =>
                      isObject(entryValue) || Array.isArray(entryValue) ? (
                        <RenderValue
                          key={`${label}-${index}-${entryKey}`}
                          label={entryKey}
                          value={entryValue}
                        />
                      ) : (
                        <DetailRow
                          key={`${label}-${index}-${entryKey}`}
                          label={entryKey}
                          value={toText(entryValue)}
                        />
                      ),
                    )
                  ) : (
                    <DetailRow
                      label={`Item ${index + 1}`}
                      value={toText(entry)}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="admin-empty-state">No items available.</p>
          )}
        </div>
      </details>
    );
  }

  if (isObject(value)) {
    const entries = Object.entries(value);
    return (
      <details className="admin-collapse" open={false}>
        <summary>{label}</summary>
        <div className="admin-collapse-body">
          {entries.length ? (
            entries.map(([entryKey, entryValue]) =>
              isObject(entryValue) || Array.isArray(entryValue) ? (
                <RenderValue
                  key={`${label}-${entryKey}`}
                  label={entryKey}
                  value={entryValue}
                />
              ) : (
                <DetailRow
                  key={`${label}-${entryKey}`}
                  label={entryKey}
                  value={toText(entryValue)}
                />
              ),
            )
          ) : (
            <p className="admin-empty-state">No details available.</p>
          )}
        </div>
      </details>
    );
  }

  return <DetailRow label={label} value={toText(value)} />;
}

function FormatSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  return (
    <section className="admin-section">
      <h3>{title}</h3>
      <div className="admin-format-grid">
        {Object.entries(data).map(([key, value]) => (
          <RenderValue key={`${title}-${key}`} label={key} value={value} />
        ))}
      </div>
    </section>
  );
}

export default function TravelAdminDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("debarghya.85@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    setLoadingRecords(true);
    fetch("/api/admin/itineraries", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          setAuthenticated(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.records) {
          setRecords(data.records);
        }
      })
      .catch(() => null)
      .finally(() => setLoadingRecords(false));
  }, [authenticated]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid login");
      }

      setAuthenticated(true);
    } catch {
      setError("Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuthenticated(false);
    setRecords([]);
    setSelectedRecord(null);
    router.refresh();
  };

  const selectedInput = useMemo(
    () => (selectedRecord?.input || {}) as TripSummary,
    [selectedRecord],
  );
  const selectedOutput = useMemo(
    () => (selectedRecord?.output || {}) as Record<string, unknown>,
    [selectedRecord],
  );

  if (!authenticated) {
    return (
      <main className="admin-shell">
        <form className="admin-card admin-login" onSubmit={login}>
          <div className="admin-login-copy">
            <p className="admin-kicker">Travel Admin</p>
            <h1>Generated Itineraries</h1>
            <p>Sign in to review itinerary records.</p>
          </div>

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-card admin-dashboard">
        <div className="admin-header admin-desktop-header">
          <div>
            <p className="admin-kicker">Travel Admin</p>
            <h1>Generated Itineraries</h1>
          </div>
          <button onClick={logout}>Logout</button>
        </div>

        <header className="result-mobile-header admin-mobile-header">
          <button
            className="result-mobile-back"
            type="button"
            onClick={() => router.push("/")}
            aria-label="Back to home"
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <div className="admin-mobile-title">
            <p className="admin-kicker">Travel Admin</p>
            <strong>Generated Itineraries</strong>
          </div>

          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-menu"
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              className="result-menu-backdrop"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className="landing-mobile-menu result-mobile-menu is-logged-in"
              id="admin-mobile-menu"
              role="menu"
            >
              <div className="landing-mobile-menu-user-card">
                <span className="landing-mobile-menu-user-avatar">
                  <UserRound size={42} />
                </span>
                <div>
                  <strong>Admin Account</strong>
                  <p>{email}</p>
                </div>
              </div>

              <div className="landing-mobile-menu-links">
                <Link
                  href="/"
                  className="landing-mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <Home size={18} />
                  </span>
                  <strong>Home</strong>
                  <ChevronRight size={20} />
                </Link>

                <Link
                  href="/itineraries"
                  className="landing-mobile-menu-link active"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <CalendarDays size={18} />
                  </span>
                  <strong>My Travel Plans</strong>
                  <ChevronRight size={20} />
                </Link>

                <Link
                  href="/generate-itinerary"
                  className="landing-mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="landing-mobile-menu-item-icon">
                    <Sparkles size={18} />
                  </span>
                  <strong>Plan Another Trip</strong>
                  <ChevronRight size={20} />
                </Link>
              </div>

              <button
                type="button"
                className="landing-mobile-menu-logout"
                onClick={logout}
              >
                <span className="landing-mobile-menu-item-icon">
                  <LogOut size={18} />
                </span>
                <strong>Logout</strong>
              </button>
            </div>
          </>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <colgroup>
              <col style={{ width: "14%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Origin</th>
                <th>Destination</th>
                <th>Travel Days</th>
                <th>Budget</th>
                <th>Travel Style</th>
                <th>Person</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingRecords ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Loading records...
                  </td>
                </tr>
              ) : records.length ? (
                records.map((record) => {
                  const input = record.input as TripSummary;
                  return (
                    <tr key={record.id}>
                      <td>{toText(input.source)}</td>
                      <td>{toText(input.destination)}</td>
                      <td>{toText(input.days)}</td>
                      <td>{toText(input.budget)}</td>
                      <td>{toText(input.travelStyle)}</td>
                      <td>{formatPeople(input.adults, input.children)}</td>
                      <td>{formatDate(record.createdAt)}</td>
                      <td>
                        <button
                          className="admin-icon-button"
                          onClick={() => setSelectedRecord(record)}
                          aria-label="View itinerary"
                          title="View itinerary"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    No itineraries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRecord ? (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedRecord(null)}
        >
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-kicker">Itinerary Details</p>
                <h2 id="admin-modal-title">
                  {toText(selectedInput.source)} to{" "}
                  {toText(selectedInput.destination)}
                </h2>
                <p>{formatDate(selectedRecord.createdAt)}</p>
              </div>
              <button
                className="admin-close-button"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>

            <div className="admin-modal-scroll">
              <div className="admin-detail-grid">
                <DetailRow
                  label="Origin"
                  value={toText(selectedInput.source)}
                />
                <DetailRow
                  label="Destination"
                  value={toText(selectedInput.destination)}
                />
                <DetailRow
                  label="Travel Days"
                  value={toText(selectedInput.days)}
                />
                <DetailRow
                  label="Budget"
                  value={toText(selectedInput.budget)}
                />
                <DetailRow
                  label="Travel Style"
                  value={toText(selectedInput.travelStyle)}
                />
                <DetailRow
                  label="Person"
                  value={formatPeople(
                    selectedInput.adults,
                    selectedInput.children,
                  )}
                />
              </div>

              <FormatSection title="Input" data={selectedRecord.input} />
              <FormatSection title="AI Response" data={selectedOutput} />
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
