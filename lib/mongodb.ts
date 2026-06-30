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
    globalForMongo.mongoClient = new MongoClient(uri);
  }

  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = globalForMongo.mongoClient.connect();
  }

  return globalForMongo.mongoClientPromise;
}

export async function connectDB() {
  const connectedClient = await connectMongoClient();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  const dbName =
    process.env.MONGODB_DB_NAME ||
    new URL(uri).pathname.replace(/^\/+/, "") ||
    "travel_tuner";

  return connectedClient.db(dbName);
}
