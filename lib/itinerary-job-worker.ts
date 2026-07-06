import { buildCoverImageUrl } from "./cover-image";
import { callAI } from "./ai";
import { saveItineraryRecord } from "./itinerary-store";
import { claimItineraryJobForProcessing, getItineraryJobById, updateItineraryJob } from "./itinerary-jobs";
import { buildPrompt } from "../utils/buildPrompt";

export async function processItineraryJob(jobId: string) {
  const job = await claimItineraryJobForProcessing(jobId);

  if (!job) {
    console.warn("[jobs] skipping itinerary job because it was not pending", { jobId });
    return { started: false };
  }

  try {
    const latestJob = (await getItineraryJobById(jobId)) || job;
    const prompt = buildPrompt(latestJob.input);
    const aiResponse = await callAI(prompt, Number(latestJob.input.days));
    const coverImageUrl = buildCoverImageUrl(aiResponse.coverImagePrompt);
    const output = {
      ...aiResponse,
      coverImageUrl,
    };

    await updateItineraryJob(job.id, {
      status: "completed",
      stage: "Completed",
      output,
      error: null,
    });

    await saveItineraryRecord({
      input: latestJob.input,
      output,
      userId: latestJob.userId,
    });

    return { started: true, completed: true };
  } catch (error: any) {
    console.error("[jobs] itinerary processing failed", error);

    await updateItineraryJob(job.id, {
      status: "failed",
      stage: "Failed",
      error: error?.message || "Unknown error",
    });

    return { started: true, completed: false };
  }
}
