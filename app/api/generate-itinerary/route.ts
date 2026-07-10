import { getAuthenticatedUserFromRequest } from "../../../lib/user-auth";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const user = getAuthenticatedUserFromRequest();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await req.json().catch(() => null);
    return Response.json(
      {
        success: false,
        message: "Payment is required before itinerary generation",
      },
      { status: 402 },
    );
  } catch (error: any) {
    console.error("Failed to generate itinerary:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate itinerary",
        error: error?.message || "Unknown error",
      },
      { status: 503 },
    );
  }
}
