import { NextResponse } from "next/server";
import {
  buildRedirectUri,
  createOAuthState,
  getOAuthReturnToCookieName,
  getOAuthReturnToCookieOptions,
  getOAuthStateCookieName,
  getOAuthStateCookieOptions,
  getProviderLoginConfig,
  normalizeReturnTo,
  type OAuthProvider,
} from "../../../../../lib/oauth";

function isProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "facebook";
}

export async function GET(req: Request, context: { params: { provider: string } }) {
  const { provider: rawProvider } = context.params;
  if (!isProvider(rawProvider)) {
    return NextResponse.json({ success: false, message: "Unsupported provider" }, { status: 400 });
  }

  const config = getProviderLoginConfig(rawProvider);
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json(
      { success: false, message: `${rawProvider} OAuth is not configured` },
      { status: 500 },
    );
  }

  const state = createOAuthState();
  const requestUrl = new URL(req.url);
  const returnTo = normalizeReturnTo(requestUrl.searchParams.get("returnTo"));
  const origin = requestUrl.origin;
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", buildRedirectUri(origin, rawProvider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  if (rawProvider === "google") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
  }

  const response = NextResponse.redirect(url.toString());
  response.cookies.set(getOAuthStateCookieName(), state, getOAuthStateCookieOptions());
  response.cookies.set(getOAuthReturnToCookieName(), returnTo, getOAuthReturnToCookieOptions());
  return response;
}
