import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

const INDEXEDDB_DATABASE_NAME = "exams_ai_grader";
const client = new PGlite(`idb://${INDEXEDDB_DATABASE_NAME}`, {
  relaxedDurability: true,
});
export const db = drizzle({ client, schema });
