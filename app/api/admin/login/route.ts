import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminCookieName,
  verifyAdminCredentials,
} from "../../../../lib/admin-auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: getAdminCookieName(),
    value: createAdminSessionToken(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
