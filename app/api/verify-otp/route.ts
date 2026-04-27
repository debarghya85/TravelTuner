import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { otp } = await req.json();

  return NextResponse.json({ verified: otp === "123456" });
}