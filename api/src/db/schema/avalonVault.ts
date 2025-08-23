import { mysqlTable, mysqlEnum, varchar, timestamp, int } from "drizzle-orm/mysql-core";
import { init } from "@paralleldrive/cuid2";

const cuidLength = 20;
const cuid = init({ length: cuidLength });

export const avalonVault = mysqlTable("avalon_vault", {
  id: varchar("id", { length: cuidLength })
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: varchar("name", { length: 20 }).notNull(),
  uriRegex: varchar("uri_regex", { length: 30 }).notNull(),
  kind: mysqlEnum(["username", "email", "password"]).notNull(),
  content: varchar("content", { length: 50 }).notNull(),
  group: int("group", { unsigned: true }).default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
