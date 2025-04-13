import {
    mysqlTable,
    varchar,
    timestamp,
    primaryKey
} from 'drizzle-orm/mysql-core'
import {avalonDevices} from "@db/schema/avalonDevices.ts";
import {relations} from "drizzle-orm";

export const avalonAuthPermissions = mysqlTable(
    'avalon_auth_permissions',
    {
        sourceId:
            varchar('source_id', {length: 20})
                .references(() => avalonDevices.id, {onDelete: 'cascade'})
                .notNull(),
        destinationId:
            varchar('destination_id', {length: 20})
                .references(() => avalonDevices.id, {onDelete: 'cascade'})
                .notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    }, (table) => [
        primaryKey({name: 'source_to_destination_pk', columns: [table.sourceId, table.destinationId]}),
    ]
)

export const avalonAuthPermissionsRelations = relations(avalonAuthPermissions, ({one}) => ({
    sourceDevice: one(avalonDevices, {
        fields: [avalonAuthPermissions.sourceId],
        references: [avalonDevices.id],
        relationName: 'authSources'
    }),
    destinationDevice: one(avalonDevices, {
        fields: [avalonAuthPermissions.destinationId],
        references: [avalonDevices.id],
        relationName: 'authDestinations'
    })
}))