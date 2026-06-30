import { NextResponse } from "next/server";
import { normalizeCountryCode, normalizeMobile } from "../../../../lib/user-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile || ""));
  const countryCode = normalizeCountryCode(String(body.countryCode || "+91"));

  if (!mobile) {
    return NextResponse.json({ success: false, message: "Mobile number is required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    mobile,
    countryCode,
    otp: process.env.NODE_ENV === "production" ? undefined : "123456",
  });
}
