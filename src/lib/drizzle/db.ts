import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { Sql } from "postgres";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Please set DATABASE_URL in the environment");
}

let connection: Sql<Record<string, unknown>>;

if (process.env.NODE_ENV === "production") {
  connection = postgres(process.env.DATABASE_URL);
} else {
  const globalConnection = global as typeof globalThis & {
    connection: Sql<Record<string, unknown>>;
  };

  if (!globalConnection.connection)
    globalConnection.connection = postgres(process.env.DATABASE_URL);

  connection = globalConnection.connection;
}

export const db = drizzle(connection, {
  schema,
});
