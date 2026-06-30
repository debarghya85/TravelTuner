import { ObjectId } from "mongodb";
import { connectDB } from "./mongodb";
import { normalizeCountryCode, normalizeMobile } from "./user-auth";

export type StoredUser = {
  id: string;
  countryCode: string;
  mobile: string;
  createdAt: string;
  createdAtMs: number;
};

const COLLECTION_NAME = "users";

function normalizeUser(record: {
  _id: ObjectId;
  countryCode: string;
  mobile: string;
  createdAt?: Date;
}) {
  const createdAt = record.createdAt || new Date(0);
  return {
    id: record._id.toString(),
    countryCode: record.countryCode,
    mobile: record.mobile,
    createdAt: createdAt.toISOString(),
    createdAtMs: createdAt.getTime(),
  } satisfies StoredUser;
}

export async function upsertUserByMobile(mobile: string, countryCode = "+91") {
  const db = await connectDB();
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  const normalizedMobile = normalizeMobile(mobile);
  const now = new Date();

  const existing = await db
    .collection(COLLECTION_NAME)
    .findOne({ countryCode: normalizedCountryCode, mobile: normalizedMobile });
  if (existing) {
    return normalizeUser(existing as any);
  }

  const result = await db.collection(COLLECTION_NAME).insertOne({
    countryCode: normalizedCountryCode,
    mobile: normalizedMobile,
    createdAt: now,
  });

  return {
    id: result.insertedId.toString(),
    countryCode: normalizedCountryCode,
    mobile: normalizedMobile,
    createdAt: now.toISOString(),
    createdAtMs: now.getTime(),
  } satisfies StoredUser;
}

export async function getUserById(userId: string) {
  const db = await connectDB();
  const user = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(userId) });
  return user ? normalizeUser(user as any) : null;
}
