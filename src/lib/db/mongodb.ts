import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const mongoUri = uri;
const dbName = "ai-learning-tutor";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

globalForMongoose.mongoose ??= { conn: null, promise: null };

export async function connectToDatabase() {
  if (globalForMongoose.mongoose?.conn) {
    return globalForMongoose.mongoose.conn;
  }

  globalForMongoose.mongoose!.promise ??= mongoose.connect(mongoUri, {
    dbName,
    bufferCommands: false,
  });

  globalForMongoose.mongoose!.conn = await globalForMongoose.mongoose!.promise;
  return globalForMongoose.mongoose!.conn;
}
