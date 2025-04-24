import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as curl from "./schema/curl";
import * as avalonDevices from "./schema/avalonDevices";
import * as avalonFcmTokens from "./schema/avalonFcmTokens";
import * as avalonAuthPermissions from "./schema/avalonAuthPermissions.ts";
import * as auth from "./schema/auth.ts";

const connection = await mysql.createConnection({
  host: Bun.env.DB_HOST,
  user: Bun.env.DB_USER,
  password: Bun.env.DB_PASSWORD,
  database: Bun.env.DB_NAME,
});

export const db = drizzle({
  client: connection,
  mode: "default",
  schema: {
    ...curl,
    ...avalonDevices,
    ...avalonFcmTokens,
    ...avalonAuthPermissions,
    ...auth,
  },
});
