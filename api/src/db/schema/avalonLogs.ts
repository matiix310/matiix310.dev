import {
  mysqlTable,
  varchar,
  timestamp,
  primaryKey,
  boolean,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

import { avalonDevices } from "./avalonDevices.ts";
import { avalonClients } from "./avalonClients";
import { init } from "@paralleldrive/cuid2";

const cuidLength = 20;
const cuid = init({ length: cuidLength });

export const avalonLogs = mysqlTable("avalon_logs", {
  id: varchar("id", { length: cuidLength })
    .$defaultFn(() => cuid())
    .primaryKey(),
  deviceId: varchar("device_id", { length: 20 }).references(() => avalonDevices.id, {
    onDelete: "cascade",
  }),
  clientId: varchar("client_id", { length: 20 })
    .references(() => avalonClients.id, { onDelete: "cascade" })
    .notNull(),
  answer: boolean("answer"),
  kind: mysqlEnum("kind", ["request", "answer", "timeout"]).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const avalonLogsRelations = relations(avalonLogs, ({ one }) => ({
  device: one(avalonDevices, {
    fields: [avalonLogs.deviceId],
    references: [avalonDevices.id],
  }),
  client: one(avalonClients, {
    fields: [avalonLogs.clientId],
    references: [avalonClients.id],
  }),
}));
