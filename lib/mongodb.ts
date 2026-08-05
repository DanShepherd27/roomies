import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }

  return global._mongoClientPromise;
}

export const databaseName = process.env.MONGODB_DB || "roomies";
