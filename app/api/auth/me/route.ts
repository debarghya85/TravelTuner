import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getUserById } from "../../../../lib/users";

export async function GET() {
  const authUser = getAuthenticatedUserFromRequest();
  if (!authUser) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  try {
    const user = await getUserById(authUser.id);
    return NextResponse.json({ success: true, user: user || authUser });
  } catch (error) {
    console.warn("Falling back to cookie-backed user session:", error);
    return NextResponse.json({ success: true, user: authUser });
  }
}
