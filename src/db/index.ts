import { PGlite } from "@electric-sql/pglite";
import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { createSchemaQueries } from "./create-schema-queries";

const INDEXEDDB_DATABASE_NAME = "exams_ai_grader";

export type DbInstance = PgliteDatabase<typeof schema>;

let dbInstancePromise: Promise<DbInstance> | null = null;

export async function initializeDatabase(): Promise<DbInstance> {
  if (dbInstancePromise) {
    return dbInstancePromise;
  }

  dbInstancePromise = (async () => {
    try {
      console.info("🚀 Initializing local database...");
      const client = await PGlite.create(`idb://${INDEXEDDB_DATABASE_NAME}`, {
        relaxedDurability: true,
      });
      const db = drizzle(client, { schema });

      console.info("⚙️ Syncing local database schema...");
      for (const query of createSchemaQueries) {
        await db.execute(query);
      }
      console.info("✅ Local database ready");
      return db;
    } catch (error) {
      console.error(`❌ Local database initialization failed: ${error}`);
      dbInstancePromise = null;
      throw error;
    }
  })();

  return dbInstancePromise;
}
