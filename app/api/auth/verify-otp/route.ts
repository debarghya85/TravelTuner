import { NextResponse } from "next/server";
import { createUserSessionToken, getUserCookieName, getUserSessionCookieOptions, normalizeCountryCode, normalizeMobile } from "../../../../lib/user-auth";
import { upsertUserByMobile } from "../../../../lib/users";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile || ""));
  const countryCode = normalizeCountryCode(String(body.countryCode || "+91"));
  const otp = String(body.otp || "").trim();

  if (!mobile || !otp) {
    return NextResponse.json({ success: false, message: "Mobile number and OTP are required" }, { status: 400 });
  }

  const expectedOtp = process.env.NODE_ENV === "production" ? null : "123456";
  if (expectedOtp && otp !== expectedOtp) {
    return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 401 });
  }

  const user = await upsertUserByMobile(mobile, countryCode);
  const response = NextResponse.json({ success: true, user });
  response.cookies.set(getUserCookieName(), createUserSessionToken(user), getUserSessionCookieOptions());
  return response;
}
