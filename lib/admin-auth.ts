import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "debarghya.85@gmail.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "RupinAndRijun2115";
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "travel-tuner-admin-secret";
const ADMIN_COOKIE_NAME = "travel_tuner_admin_session";

function sign(value: string) {
  return crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(value)
    .digest("hex");
}

export function verifyAdminCredentials(email: string, password: string) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createAdminSessionToken(email: string) {
  const issuedAt = Date.now().toString();
  const payload = `${email}:${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function parseAdminSessionToken(token?: string | null) {
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

  const [email, issuedAt] = payload.split(":");
  if (email !== ADMIN_EMAIL || !issuedAt) {
    return null;
  }

  return { email, issuedAt: Number(issuedAt) };
}

export function isAdminSessionValid() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(parseAdminSessionToken(token));
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}
