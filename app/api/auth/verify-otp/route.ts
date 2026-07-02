import { NextResponse } from "next/server";
import { createStableUserId, createUserSessionToken, getUserCookieName, getUserSessionCookieOptions, normalizeCountryCode, normalizeMobile } from "../../../../lib/user-auth";
import { upsertUserByMobile } from "../../../../lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const mobile = normalizeMobile(String(body.mobile || ""));
    const countryCode = normalizeCountryCode(String(body.countryCode || "+91"));
    const otp = String(body.otp || "").trim();

    console.info("[auth] verify-otp request", {
      countryCode,
      mobileLast4: mobile.slice(-4),
      hasOtp: Boolean(otp),
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      dbName: process.env.MONGODB_DB_NAME || null,
    });

    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, message: "Mobile number and OTP are required" },
        { status: 400 },
      );
    }

    const expectedOtp = "123456";
    if (otp !== expectedOtp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 401 },
      );
    }

    let user;
    try {
      user = await upsertUserByMobile(mobile, countryCode);
    } catch (dbError) {
      console.warn("[auth] falling back to stateless login session", {
        message: dbError instanceof Error ? dbError.message : String(dbError),
        name: dbError instanceof Error ? dbError.name : undefined,
        code: dbError && typeof dbError === "object" ? (dbError as { code?: unknown }).code : undefined,
      });
      user = {
        id: createStableUserId(countryCode, mobile),
        countryCode,
        mobile,
      };
    }
    const response = NextResponse.json({ success: true, user });
    response.cookies.set(
      getUserCookieName(),
      createUserSessionToken(user),
      getUserSessionCookieOptions(),
    );
    console.info("[auth] verify-otp success", {
      userId: user.id,
      countryCode: user.countryCode,
      mobileLast4: user.mobile.slice(-4),
    });
    return response;
  } catch (error) {
    console.error("[auth] verify-otp failed", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      code: error && typeof error === "object" ? (error as { code?: unknown }).code : undefined,
    });
    return NextResponse.json(
      { success: false, message: "Unable to verify OTP right now" },
      { status: 500 },
    );
  }
}
