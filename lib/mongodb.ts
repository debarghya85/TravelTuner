import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

export async function connectMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!globalForMongo.mongoClient) {
    console.info("[mongo] creating client", {
      hasUri: Boolean(uri),
      dbName: process.env.MONGODB_DB_NAME || new URL(uri).pathname.replace(/^\/+/, "") || "travel_tuner",
      nodeEnv: process.env.NODE_ENV,
    });
    globalForMongo.mongoClient = new MongoClient(uri);
  }

  if (!globalForMongo.mongoClientPromise) {
    console.info("[mongo] connecting");
    globalForMongo.mongoClientPromise = globalForMongo.mongoClient.connect();
  }

  try {
    return await globalForMongo.mongoClientPromise;
  } catch (error) {
    console.error("[mongo] connect failed", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      code: error && typeof error === "object" ? (error as { code?: unknown }).code : undefined,
    });
    throw error;
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  const dbName =
    process.env.MONGODB_DB_NAME ||
    new URL(uri).pathname.replace(/^\/+/, "") ||
    "travel_tuner";
  console.info("[mongo] selecting db", { dbName });
  const connectedClient = await connectMongoClient();

  return connectedClient.db(dbName);
}
