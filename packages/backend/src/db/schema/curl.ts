import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const curl = mysqlTable("curl", {
  id: varchar("id", { length: 20 }).primaryKey(),
  fps: int("fps"),
});

export type Curl = typeof curl.$inferSelect; // return type when queried
export type NewCurl = typeof curl.$inferInsert; // insert type
