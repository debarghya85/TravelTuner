import { NextResponse } from "next/server";
import { processItineraryJob } from "../../../../../lib/itinerary-job-worker";
import { getItineraryJobById } from "../../../../../lib/itinerary-jobs";
import { getPaymentOrderById } from "../../../../../lib/payments";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const job = await getItineraryJobById(params.id);

  if (!job) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const paymentOrderId = String((job.input as any)?.paymentOrderId || "");
  const paymentOrder = paymentOrderId ? await getPaymentOrderById(paymentOrderId) : null;
  if (!paymentOrder || paymentOrder.status !== "verified") {
    return NextResponse.json(
      { success: false, message: "Payment required before AI generation" },
      { status: 402 },
    );
  }

  void processItineraryJob(job.id).catch((error) => {
    console.error("[jobs] failed to process itinerary job", error);
  });

  return NextResponse.json({ success: true, started: true }, { status: 202 });
}
