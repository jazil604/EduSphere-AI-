import mongoose from "mongoose";

const dbName = "ai-learning-tutor";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

globalForMongoose.mongoose ??= { conn: null, promise: null };

async function connectWithUri(uri: string) {
  return mongoose.connect(uri, {
    dbName,
    bufferCommands: false,
    connectTimeoutMS: 5_000,
    serverSelectionTimeoutMS: 5_000,
  });
}

export async function connectToDatabase() {
  if (globalForMongoose.mongoose?.conn) {
    return globalForMongoose.mongoose.conn;
  }

  if (!globalForMongoose.mongoose?.promise) {
    globalForMongoose.mongoose!.promise = (async () => {
      const uri = process.env.MONGODB_URI?.trim();

      if (!uri) {
        throw new Error("Missing MONGODB_URI environment variable.");
      }

      return connectWithUri(uri);
    })();
  }

  try {
    globalForMongoose.mongoose!.conn = await globalForMongoose.mongoose!.promise;
    return globalForMongoose.mongoose!.conn;
  } catch (error) {
    globalForMongoose.mongoose!.promise = null;
    throw error;
  }
}
