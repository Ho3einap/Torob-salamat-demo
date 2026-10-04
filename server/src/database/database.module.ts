import { Global, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const DB_TOKEN = "TOROB_DB";

// This DB "handle" is intentionally minimal — controllers just import the
// Mongoose models directly from `./models`. We keep the token around so
// anything that needs the live connection URI (health checks, tests) can
// inject it easily.
export type DatabaseHandle = {
  uri: string;
  connectionState: () => number;
};

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: async (): Promise<DatabaseHandle> => {
        let uri = process.env.MONGODB_URI;

        if (!uri) {
          const mem = await MongoMemoryServer.create({
            instance: { dbName: "torob_salamat" },
          });
          uri = mem.getUri("torob_salamat");
          // Keep a reference so the process can shut it down gracefully.
          (global as any).__TOROB_MONGO_MEM__ = mem;
          console.log(`🍃 In-process MongoDB started at ${uri}`);
        } else {
          console.log(`🍃 Connecting to external MongoDB at ${uri}`);
        }

        mongoose.set("strictQuery", true);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log("✅ Mongoose connected");

        return {
          uri,
          connectionState: () => mongoose.connection.readyState,
        };
      },
    },
  ],
  exports: [DB_TOKEN],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    /* connection is created lazily by the useFactory */
  }

  async onModuleDestroy() {
    try {
      await mongoose.disconnect();
      const mem = (global as any).__TOROB_MONGO_MEM__ as MongoMemoryServer | undefined;
      if (mem) await mem.stop();
    } catch (err) {
      console.error("Error during Mongo shutdown:", err);
    }
  }
}
