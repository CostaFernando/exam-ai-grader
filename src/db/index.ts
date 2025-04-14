import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { createSchemaQueries } from "./create-schema-queries";

const INDEXEDDB_DATABASE_NAME = "exams_ai_grader";

export async function initializeDatabase() {
  const client = await PGlite.create(`idb://${INDEXEDDB_DATABASE_NAME}`, {
    relaxedDurability: true,
  });
  const db = drizzle({
    client,
    schema,
  });

  let isLocalDBSchemaSynced = false;
  if (!isLocalDBSchemaSynced) {
    try {
      // Execute each query sequentially
      for (const query of createSchemaQueries) {
        await db.execute(query);
      }
      isLocalDBSchemaSynced = true;
      console.info(`✅ Local database ready`);
    } catch (error) {
      console.error(`❌ Local database failed to sync: ${error}`);
    }
  }

  return db;
}
