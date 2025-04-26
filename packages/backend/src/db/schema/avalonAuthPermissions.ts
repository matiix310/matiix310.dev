import { mysqlTable, varchar, timestamp, primaryKey } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

import { avalonDevices } from "./avalonDevices.ts";
import { avalonClients } from "./avalonClients";

export const avalonAuthPermissions = mysqlTable(
  "avalon_auth_permissions",
  {
    deviceId: varchar("device_id", { length: 20 })
      .references(() => avalonDevices.id, { onDelete: "cascade" })
      .notNull(),
    clientId: varchar("client_id", { length: 20 })
      .references(() => avalonClients.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "device_to_client_pk",
      columns: [table.deviceId, table.clientId],
    }),
  ]
);

export const avalonAuthPermissionsRelations = relations(
  avalonAuthPermissions,
  ({ one }) => ({
    device: one(avalonDevices, {
      fields: [avalonAuthPermissions.deviceId],
      references: [avalonDevices.id],
    }),
    client: one(avalonClients, {
      fields: [avalonAuthPermissions.clientId],
      references: [avalonClients.id],
    }),
  })
);
