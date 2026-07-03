import crypto from "crypto";
import { ObjectId } from "mongodb";
import { connectDB } from "./mongodb";

export type ItineraryJobStatus = "queued" | "processing" | "saving" | "done" | "failed";

export type StoredItineraryJob = {
  id: string;
  userId: string;
  secret: string;
  status: ItineraryJobStatus;
  stage: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  createdAt: string;
  createdAtMs: number;
  updatedAt: string;
  updatedAtMs: number;
};

const COLLECTION_NAME = "itinerary_jobs";

function normalizeJob(record: {
  _id: ObjectId;
  userId: ObjectId | string;
  secret: string;
  status?: ItineraryJobStatus;
  stage?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const createdAt = record.createdAt || new Date(0);
  const updatedAt = record.updatedAt || createdAt;

  return {
    id: record._id.toString(),
    userId: record.userId.toString(),
    secret: record.secret,
    status: record.status || "queued",
    stage: record.stage || "Queued",
    input: record.input || {},
    output: record.output || null,
    error: record.error || null,
    createdAt: createdAt.toISOString(),
    createdAtMs: createdAt.getTime(),
    updatedAt: updatedAt.toISOString(),
    updatedAtMs: updatedAt.getTime(),
  } satisfies StoredItineraryJob;
}

export async function createItineraryJob(data: {
  userId: string;
  input: Record<string, unknown>;
}) {
  const db = await connectDB();
  const now = new Date();
  const secret = crypto.randomUUID().replace(/-/g, "");

  const result = await db.collection(COLLECTION_NAME).insertOne({
    userId: new ObjectId(data.userId),
    secret,
    status: "queued" as const,
    stage: "Queued",
    input: data.input,
    output: null,
    error: null,
    createdAt: now,
    updatedAt: now,
  });

  return normalizeJob({
    _id: result.insertedId,
    userId: data.userId,
    secret,
    status: "queued",
    stage: "Queued",
    input: data.input,
    output: null,
    error: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getItineraryJobById(jobId: string) {
  const db = await connectDB();
  const record = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(jobId) });
  return record ? normalizeJob(record as any) : null;
}

export async function getItineraryJobByIdForUser(jobId: string, userId: string) {
  const db = await connectDB();
  const record = await db
    .collection(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(jobId), userId: new ObjectId(userId) });
  return record ? normalizeJob(record as any) : null;
}

export async function updateItineraryJob(jobId: string, patch: Partial<Pick<StoredItineraryJob, "status" | "stage" | "output" | "error">>) {
  const db = await connectDB();
  const now = new Date();

  await db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(jobId) },
    {
      $set: {
        ...patch,
        updatedAt: now,
      },
    },
  );
}
