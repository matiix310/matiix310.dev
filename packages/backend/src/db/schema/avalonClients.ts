import { mysqlTable, mysqlEnum, varchar, timestamp } from "drizzle-orm/mysql-core";
import { init } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { avalonAuthPermissions } from "@db/schema/avalonAuthPermissions";

const cuidLength = 20;
const cuid = init({ length: cuidLength });

export const avalonClients = mysqlTable("avalon_clients", {
  id: varchar("id", { length: cuidLength })
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: varchar("name", { length: 20 }).notNull(),
  kind: mysqlEnum("kind", ["web_extension", "pam"]).default("web_extension").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const avalonClientsRelations = relations(avalonClients, ({ many }) => ({
  permissions: many(avalonAuthPermissions),
}));
