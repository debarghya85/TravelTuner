import crypto from "crypto";
import { cookies } from "next/headers";

export type AuthenticatedUser = {
  id: string;
  countryCode: string;
  mobile: string;
  createdAt?: string;
};

const USER_SESSION_SECRET =
  process.env.USER_SESSION_SECRET || "travel-tuner-user-secret";
const USER_COOKIE_NAME = "travel_tuner_user_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string) {
  return crypto.createHmac("sha256", USER_SESSION_SECRET).update(value).digest("hex");
}

export function normalizeMobile(mobile: string) {
  return mobile.replace(/[^\d]/g, "").slice(0, 15);
}

export function normalizeCountryCode(countryCode: string) {
  const digits = countryCode.replace(/[^\d]/g, "");
  return digits ? `+${digits}` : "+91";
}

export function createStableUserId(countryCode: string, mobile: string) {
  return crypto
    .createHash("sha256")
    .update(`${normalizeCountryCode(countryCode)}:${normalizeMobile(mobile)}`)
    .digest("hex")
    .slice(0, 24);
}

export function createUserSessionToken(user: { id: string; mobile: string }) {
  const issuedAt = Date.now().toString();
  const payload = `${user.id}:${user.mobile}:${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function parseUserSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) {
    return null;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  const [id, mobile, issuedAt] = payload.split(":");
  if (!id || !mobile || !issuedAt) {
    return null;
  }

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE_SECONDS * 1000) {
    return null;
  }

  return { id, mobile, issuedAt: Number(issuedAt) };
}

export function getAuthenticatedUserFromRequest() {
  const token = cookies().get(USER_COOKIE_NAME)?.value;
  const session = parseUserSessionToken(token);
  return session ? { id: session.id, mobile: session.mobile, countryCode: "+91" } : null;
}

export function getUserCookieName() {
  return USER_COOKIE_NAME;
}

export function getUserSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
