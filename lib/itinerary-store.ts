import { connectDB, connectMongoClient } from "./mongodb";
import { ObjectId } from "mongodb";

export type StoredItineraryRecord = {
  id: string;
  createdAt: string;
  createdAtMs: number;
  userId?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

const COLLECTION_NAMES = [
  "itinerary_generations",
  "Itinerary_generations",
];

function getDatabaseName() {
  return process.env.MONGODB_DB_NAME || "travel_tuner";
}

function normalizeRecord(record: {
  _id: { toString: () => string };
  createdAt?: Date;
  userId?: ObjectId | string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}) {
  const createdAt = record.createdAt || new Date(0);
  return {
    id: record._id.toString(),
    createdAt: createdAt.toISOString(),
    createdAtMs: createdAt.getTime(),
    userId: record.userId?.toString(),
    input: record.input || {},
    output: record.output || {},
  } satisfies StoredItineraryRecord;
}

export async function saveItineraryRecord(data: {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  userId: string;
}) {
  const db = await connectDB();
  const result = await db.collection(COLLECTION_NAMES[0]).insertOne({
    input: data.input,
    output: data.output,
    userId: new ObjectId(data.userId),
    createdAt: new Date(),
  });

  return result.insertedId.toString();
}

export async function listItineraryRecords() {
  const client = await connectMongoClient();
  const dbName = getDatabaseName();
  const records = await Promise.all(
    COLLECTION_NAMES.map(async (collectionName) => {
      return client
        .db(dbName)
        .collection(collectionName)
        .find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();
    }),
  );

  const merged = records
    .flat()
    .map(normalizeRecord)
    .filter((record, index, array) => {
      return array.findIndex((item) => item.id === record.id) === index;
    })
    .sort((a, b) => b.createdAtMs - a.createdAtMs);

  return merged;
}

export async function listItineraryRecordsByUser(userId: string) {
  const client = await connectMongoClient();
  const queryUserId = new ObjectId(userId);
  const dbName = getDatabaseName();
  const records = await Promise.all(
    COLLECTION_NAMES.map(async (collectionName) => {
      return client
        .db(dbName)
        .collection(collectionName)
        .find({ userId: queryUserId })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();
    }),
  );

  return records
    .flat()
    .map(normalizeRecord)
    .filter((record, index, array) => array.findIndex((item) => item.id === record.id) === index)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export async function listGlobalItineraryRecords() {
  const client = await connectMongoClient();
  const dbName = getDatabaseName();
  const records = await Promise.all(
    COLLECTION_NAMES.map(async (collectionName) => {
      return client
        .db(dbName)
        .collection(collectionName)
        .find({ isGlobal: true })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();
    }),
  );

  return records
    .flat()
    .map(normalizeRecord)
    .filter((record, index, array) => array.findIndex((item) => item.id === record.id) === index)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export async function getItineraryRecordById(recordId: string) {
  const client = await connectMongoClient();
  const dbName = getDatabaseName();
  for (const collectionName of COLLECTION_NAMES) {
    const record = await client.db(dbName).collection(collectionName).findOne({ _id: new ObjectId(recordId) });
    if (record) {
      return normalizeRecord(record as any);
    }
  }

  return null;
}

export async function getItineraryRecordByIdForUser(recordId: string, userId: string) {
  const client = await connectMongoClient();
  const queryUserId = new ObjectId(userId);
  const dbName = getDatabaseName();

  for (const collectionName of COLLECTION_NAMES) {
    const record = await client
      .db(dbName)
      .collection(collectionName)
      .findOne({ _id: new ObjectId(recordId), userId: queryUserId });
    if (record) {
      return normalizeRecord(record as any);
    }
  }

  return null;
}

export async function getItineraryRecordByIdVisibleToUser(recordId: string, userId?: string) {
  const client = await connectMongoClient();
  const dbName = getDatabaseName();
  const objectId = new ObjectId(recordId);

  for (const collectionName of COLLECTION_NAMES) {
    const collection = client.db(dbName).collection(collectionName);
    const record = userId
      ? await collection.findOne({
          _id: objectId,
          $or: [{ userId: new ObjectId(userId) }, { isGlobal: true }],
        })
      : await collection.findOne({
          _id: objectId,
          isGlobal: true,
        });

    if (record) {
      return normalizeRecord(record as any);
    }
  }

  return null;
}
