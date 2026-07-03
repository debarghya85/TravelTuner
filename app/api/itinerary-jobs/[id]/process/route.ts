import { NextResponse } from "next/server";
import { buildPrompt } from "../../../../../utils/buildPrompt";
import { callAI } from "../../../../../lib/ai";
import { buildCoverImageUrl } from "../../../../../lib/cover-image";
import { saveItineraryRecord } from "../../../../../lib/itinerary-store";
import { getItineraryJobById, updateItineraryJob } from "../../../../../lib/itinerary-jobs";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));

  const job = await getItineraryJobById(params.id);
  if (!job || body.secret !== job.secret) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  if (job.status === "done") {
    return NextResponse.json({ success: true, alreadyDone: true });
  }

  try {
    await updateItineraryJob(job.id, {
      status: "processing",
      stage: "Calling AI",
    });

    const prompt = buildPrompt(job.input);
    const aiResponse = await callAI(prompt, Number(job.input.days));
    const coverImageUrl = buildCoverImageUrl(aiResponse.coverImagePrompt);

    await updateItineraryJob(job.id, {
      status: "saving",
      stage: "Saving your plan",
      output: {
        ...aiResponse,
        coverImageUrl,
      },
      error: null,
    });

    await saveItineraryRecord({
      input: job.input,
      output: {
        ...aiResponse,
        coverImageUrl,
      },
      userId: job.userId,
    });

    await updateItineraryJob(job.id, {
      status: "done",
      stage: "Done",
      output: {
        ...aiResponse,
        coverImageUrl,
      },
      error: null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[jobs] itinerary processing failed", error);

    await updateItineraryJob(job.id, {
      status: "failed",
      stage: "Failed",
      error: error?.message || "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate itinerary",
        error: error?.message || "Unknown error",
      },
      { status: 503 },
    );
  }
}
