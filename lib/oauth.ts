import crypto from "crypto";

export type OAuthProvider = "google" | "facebook";

const STATE_COOKIE_NAME = "travel_tuner_oauth_state";
const RETURN_TO_COOKIE_NAME = "travel_tuner_oauth_return_to";
const STATE_MAX_AGE_SECONDS = 10 * 60;

export function getOAuthStateCookieName() {
  return STATE_COOKIE_NAME;
}

export function getOAuthReturnToCookieName() {
  return RETURN_TO_COOKIE_NAME;
}

export function getOAuthStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  };
}

export function getOAuthReturnToCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  };
}

export function normalizeReturnTo(value?: string | null) {
  if (!value) return "/itineraries";
  if (!value.startsWith("/")) return "/itineraries";
  if (value.startsWith("//")) return "/itineraries";
  return value;
}

export function createOAuthState() {
  return crypto.randomBytes(24).toString("hex");
}

export function getProviderLoginConfig(provider: OAuthProvider) {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      scope: "openid email profile",
    };
  }

  return {
    clientId: process.env.FACEBOOK_APP_ID || "",
    clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    authorizeUrl: "https://www.facebook.com/v20.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v20.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)",
    scope: "email public_profile",
  };
}

export function buildRedirectUri(origin: string, provider: OAuthProvider) {
  return `${origin}/api/auth/callback/${provider}`;
}
