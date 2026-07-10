import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "../../../../../lib/user-auth";
import { getPaymentOrderById } from "../../../../../lib/payments";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const order = await getPaymentOrderById(params.id);
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
