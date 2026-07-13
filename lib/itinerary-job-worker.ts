import { buildCoverImageUrl } from "./cover-image";
import { callAI } from "./ai";
import { saveItineraryRecord } from "./itinerary-store";
import { claimItineraryJobForProcessing, getItineraryJobById, updateItineraryJob } from "./itinerary-jobs";
import { buildPrompt } from "../utils/buildPrompt";
import { getPaymentOrderById, markPaymentRefunded, requestRazorpayRefund } from "./payments";
import { normalizePlanTier } from "./plan-names";

export async function processItineraryJob(jobId: string) {
  const job = await claimItineraryJobForProcessing(jobId);
  let paymentOrder: Awaited<ReturnType<typeof getPaymentOrderById>> | null = null;

  if (!job) {
    console.warn("[jobs] skipping itinerary job because it was not pending", { jobId });
    return { started: false };
  }

  try {
    const latestJob = (await getItineraryJobById(jobId)) || job;
    const paymentOrderId = String((latestJob.input as any)?.paymentOrderId || "");
    paymentOrder = paymentOrderId ? await getPaymentOrderById(paymentOrderId) : null;

    if (!paymentOrder || paymentOrder.status !== "verified") {
      throw new Error("Payment verification required before AI generation");
    }

    const prompt = buildPrompt(latestJob.input);
    const aiResponse = await callAI(prompt, Number(latestJob.input.days));
    const coverImageUrl = buildCoverImageUrl(aiResponse.coverImagePrompt);
    const output = {
      ...aiResponse,
      coverImageUrl,
      planId: normalizePlanTier(String(latestJob.input?.planId || "silver")),
    };

    const itineraryId = await saveItineraryRecord({
      input: latestJob.input,
      output,
      userId: latestJob.userId,
    });

    await updateItineraryJob(job.id, {
      status: "completed",
      stage: "Completed",
      output: {
        ...output,
        itineraryId,
      },
      error: null,
    });
    return { started: true, completed: true, itineraryId };
  } catch (error: any) {
    console.error("[jobs] itinerary processing failed", error);

    if (paymentOrder) {
      const gatewayPaymentId = paymentOrder.gatewayPaymentId || null;
      if (gatewayPaymentId) {
        try {
          const refund = await requestRazorpayRefund({
            gatewayPaymentId,
            amount: paymentOrder.amount,
            speed: "normal",
            notes: {
              reason: "AI itinerary generation failed",
              jobId: job.id,
              orderId: paymentOrder.id,
            },
          });

          await markPaymentRefunded({
            gatewayOrderId: paymentOrder.gatewayOrderId,
            gatewayPaymentId,
            refundId: refund.id || paymentOrder.refundId || `rfnd_${paymentOrder.gatewayOrderId}`,
            refundStatus: refund.status || "processed",
          });
        } catch (refundError) {
          console.error("[jobs] razorpay refund request failed", refundError);
          await updateItineraryJob(job.id, {
            status: "failed",
            stage: "Refund failed",
            error: refundError instanceof Error ? refundError.message : "Refund request failed",
          });
          return { started: true, completed: false };
        }
      }
    }

    await updateItineraryJob(job.id, {
      status: "failed",
      stage: paymentOrder ? "Refund initiated" : "Failed",
      error: error?.message || "Unknown error",
    });

    return { started: true, completed: false };
  }
}
