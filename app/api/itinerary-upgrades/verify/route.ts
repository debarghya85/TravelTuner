import { NextResponse } from "next/server";
import { verifyItineraryUpgradePayment } from "../../../../lib/itinerary-upgrade";
import { getAuthenticatedUserFromRequest } from "../../../../lib/user-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = getAuthenticatedUserFromRequest();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const gatewayOrderId = String(body?.razorpay_order_id || body?.order_id || "");
  const gatewayPaymentId = String(body?.razorpay_payment_id || body?.payment_id || "");
  const signature = String(body?.razorpay_signature || body?.signature || "");
  const itineraryId = String(body?.itineraryId || "");

  if (!gatewayOrderId || !gatewayPaymentId || !signature || !itineraryId) {
    return NextResponse.json({ success: false, message: "Missing verification fields" }, { status: 400 });
  }

  try {
    const result = await verifyItineraryUpgradePayment({
      gatewayOrderId,
      gatewayPaymentId,
      signature,
      itineraryId,
      userId: user.id,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to verify upgrade payment" },
      { status: 409 },
    );
  }
}
