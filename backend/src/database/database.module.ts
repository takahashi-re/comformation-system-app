import { Module } from "@nestjs/common";
import { Pool } from "pg";
import { PostgresScoutDocumentStore } from "../postgresStore";
import { DATABASE_POOL, SCOUT_DOCUMENT_STORE } from "./database.constants";
import { DatabasePoolLifecycle } from "./database.pool-lifecycle";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const initializeStoreWithRetry = async (
  store: PostgresScoutDocumentStore,
  retries = 10,
) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await store.initialize();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.warn(
        `Database initialization failed (attempt ${attempt}/${retries}). Retrying...`,
      );
      await wait(2_000);
    }
  }
};

@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: () => {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
          throw new Error("DATABASE_URL is required");
        }

        return new Pool({ connectionString: databaseUrl });
      },
    },
    {
      provide: SCOUT_DOCUMENT_STORE,
      inject: [DATABASE_POOL],
      useFactory: async (pool: Pool) => {
        const store = new PostgresScoutDocumentStore(pool);
        await initializeStoreWithRetry(store);
        return store;
      },
    },
    DatabasePoolLifecycle,
  ],
  exports: [SCOUT_DOCUMENT_STORE],
})
export class DatabaseModule {}
