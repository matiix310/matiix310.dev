import {
  mysqlTable,
  varchar,
  timestamp,
  primaryKey,
  boolean,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

import { avalonDevices } from "./avalonDevices.ts";
import { avalonClients } from "./avalonClients";

export const avalonLogs = mysqlTable(
  "avalon_logs",
  {
    deviceId: varchar("device_id", { length: 20 })
      .references(() => avalonDevices.id, { onDelete: "cascade" })
      .notNull(),
    clientId: varchar("client_id", { length: 20 })
      .references(() => avalonClients.id, { onDelete: "cascade" })
      .notNull(),
    success: boolean("success").notNull(),
    date: timestamp("date").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "device_to_client_pk",
      columns: [table.clientId, table.deviceId],
    }),
  ]
);

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
