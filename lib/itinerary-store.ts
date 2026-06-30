import { connectDB, connectMongoClient } from "./mongodb";

export type StoredItineraryRecord = {
  id: string;
  createdAt: string;
  createdAtMs: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

const COLLECTION_NAMES = [
  "itinerary_generations",
  "Itinerary_generations",
];
const DATABASE_NAMES = ["travel_tuner", "test"];

function normalizeRecord(record: {
  _id: { toString: () => string };
  createdAt?: Date;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}) {
  const createdAt = record.createdAt || new Date(0);
  return {
    id: record._id.toString(),
    createdAt: createdAt.toISOString(),
    createdAtMs: createdAt.getTime(),
    input: record.input || {},
    output: record.output || {},
  } satisfies StoredItineraryRecord;
}

export async function saveItineraryRecord(data: {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}) {
  const db = await connectDB();
  const result = await db.collection(COLLECTION_NAMES[0]).insertOne({
    input: data.input,
    output: data.output,
    createdAt: new Date(),
  });

  return result.insertedId.toString();
}

export async function listItineraryRecords() {
  const client = await connectMongoClient();
  const records = await Promise.all(
    DATABASE_NAMES.flatMap((dbName) =>
      COLLECTION_NAMES.map(async (collectionName) => {
        return client
          .db(dbName)
          .collection(collectionName)
          .find({})
          .sort({ createdAt: -1 })
          .limit(200)
          .toArray();
      }),
    ),
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
