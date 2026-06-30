import { NextResponse } from "next/server";
import { getUserCookieName } from "../../../../lib/user-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getUserCookieName(), "", { path: "/", maxAge: 0 });
  return response;
}
