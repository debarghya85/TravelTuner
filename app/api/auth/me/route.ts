import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";
import { getUserById } from "../../../../lib/users";

export async function GET() {
  const authUser = getAuthenticatedUserFromRequest();
  if (!authUser) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const user = await getUserById(authUser.id);
  return NextResponse.json({ success: true, user });
}
