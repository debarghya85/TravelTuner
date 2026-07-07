import { NextResponse } from "next/server";
import { createUserSessionToken, getUserCookieName, getUserSessionCookieOptions } from "../../../../../lib/user-auth";
import {
  buildRedirectUri,
  getAppOrigin,
  getOAuthReturnToCookieName,
  getOAuthStateCookieName,
  getProviderLoginConfig,
  normalizeReturnTo,
  type OAuthProvider,
} from "../../../../../lib/oauth";
import { upsertUserByOAuthProfile } from "../../../../../lib/users";
import { cookies } from "next/headers";

function isProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "facebook";
}

async function readJsonSafe(response: Response) {
  return response.json().catch(() => null);
}

export async function GET(req: Request, context: { params: { provider: string } }) {
  const { provider: rawProvider } = context.params;
  if (!isProvider(rawProvider)) {
    return NextResponse.redirect(new URL("/login?error=provider", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get(getOAuthStateCookieName())?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=state", req.url));
  }

  const config = getProviderLoginConfig(rawProvider);
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.redirect(new URL("/login?error=config", req.url));
  }

  try {
    const redirectUri = buildRedirectUri(url.origin, rawProvider);
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code,
      }),
    });

    const tokenData = await readJsonSafe(tokenResponse);
    const accessToken = tokenData?.access_token;
    if (!tokenResponse.ok || !accessToken) {
      console.error("[auth] token exchange failed", tokenData);
      return NextResponse.redirect(new URL("/login?error=token", req.url));
    }

    const profileUrl = new URL(config.userInfoUrl);
    if (rawProvider === "google") {
      profileUrl.searchParams.set("access_token", accessToken);
    }

    const profileResponse = await fetch(profileUrl.toString(), {
      headers:
        rawProvider === "facebook"
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
    });

    const profileData = await readJsonSafe(profileResponse);
    if (!profileResponse.ok || !profileData) {
      console.error("[auth] profile fetch failed", profileData);
      return NextResponse.redirect(new URL("/login?error=profile", req.url));
    }

    const profile =
      rawProvider === "google"
        ? {
            provider: "google" as const,
            providerId: String(profileData.id),
            displayName: profileData.name || profileData.email || "Traveler",
            email: profileData.email || null,
            photoURL: profileData.picture || null,
          }
        : {
            provider: "facebook" as const,
            providerId: String(profileData.id),
            displayName: profileData.name || "Traveler",
            email: profileData.email || null,
            photoURL: profileData.picture?.data?.url || null,
          };

    const user = await upsertUserByOAuthProfile(profile);
    const returnTo = normalizeReturnTo(cookies().get(getOAuthReturnToCookieName())?.value);
    const response = NextResponse.redirect(new URL(returnTo, getAppOrigin(url.origin)));
    response.cookies.set(getUserCookieName(), createUserSessionToken({ id: user.id }), getUserSessionCookieOptions());
    response.cookies.set(getOAuthStateCookieName(), "", { path: "/", maxAge: 0 });
    response.cookies.set(getOAuthReturnToCookieName(), "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("[auth] oauth callback failed", error);
    return NextResponse.redirect(new URL("/login?error=callback", req.url));
  }
}
