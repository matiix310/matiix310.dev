import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const curl = mysqlTable("curl", {
  id: varchar("id", { length: 20 }).primaryKey(),
  fps: int("fps"),
});
