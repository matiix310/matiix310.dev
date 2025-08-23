import { relations } from "drizzle-orm";
import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { avalonDevices } from "./avalonDevices";

export const avalonFcmTokens = mysqlTable("avalon_fcm", {
  deviceId: varchar("device_id", { length: 20 })
    .references(() => avalonDevices.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  fcmToken: varchar("token", { length: 150 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const avalonFcmTokensRelations = relations(avalonFcmTokens, ({ one }) => ({
  device: one(avalonDevices, {
    fields: [avalonFcmTokens.deviceId],
    references: [avalonDevices.id],
  }),
}));
