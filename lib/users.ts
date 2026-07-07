import { ObjectId } from "mongodb";
import { connectDB } from "./mongodb";
import { createStableUserId } from "./user-auth";

export type StoredUser = {
  id: string;
  provider: "google" | "facebook" | "email" | "unknown";
  providerId: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  createdAtMs: number;
  updatedAt: string;
  updatedAtMs: number;
};

const COLLECTION_NAME = "users";

function normalizeUser(record: {
  _id: ObjectId;
  provider: "google" | "facebook" | "email" | "unknown";
  providerId: string;
  displayName?: string;
  email?: string | null;
  photoURL?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const createdAt = record.createdAt || new Date(0);
  const updatedAt = record.updatedAt || createdAt;
  return {
    id: record._id.toString(),
    provider: record.provider,
    providerId: record.providerId,
    displayName: record.displayName || "Traveler",
    email: record.email ?? null,
    photoURL: record.photoURL ?? null,
    createdAt: createdAt.toISOString(),
    createdAtMs: createdAt.getTime(),
    updatedAt: updatedAt.toISOString(),
    updatedAtMs: updatedAt.getTime(),
  } satisfies StoredUser;
}

export async function upsertUserByOAuthProfile(profile: {
  provider: "google" | "facebook";
  providerId: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}) {
  const db = await connectDB();
  const now = new Date();
  const id = createStableUserId(profile.provider, profile.providerId);
  const displayName = profile.displayName?.trim() || profile.email?.trim() || "Traveler";

  const existing = await db
    .collection(COLLECTION_NAME)
    .findOne({ provider: profile.provider, providerId: profile.providerId });

  if (existing) {
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: existing._id },
      {
        $set: {
          provider: profile.provider,
          providerId: profile.providerId,
          displayName,
          email: profile.email ?? null,
          photoURL: profile.photoURL ?? null,
          updatedAt: now,
        },
      },
    );
    return normalizeUser({
      ...(existing as any),
      provider: profile.provider,
      providerId: profile.providerId,
      displayName,
      email: profile.email ?? null,
      photoURL: profile.photoURL ?? null,
      updatedAt: now,
    });
  }

  await db.collection(COLLECTION_NAME).insertOne({
    _id: new ObjectId(id),
    provider: profile.provider,
    providerId: profile.providerId,
    displayName,
    email: profile.email ?? null,
    photoURL: profile.photoURL ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    provider: profile.provider,
    providerId: profile.providerId,
    displayName,
    email: profile.email ?? null,
    photoURL: profile.photoURL ?? null,
    createdAt: now.toISOString(),
    createdAtMs: now.getTime(),
    updatedAt: now.toISOString(),
    updatedAtMs: now.getTime(),
  } satisfies StoredUser;
}

export async function getUserById(userId: string) {
  const db = await connectDB();
  const user = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(userId) });
  return user ? normalizeUser(user as any) : null;
}
