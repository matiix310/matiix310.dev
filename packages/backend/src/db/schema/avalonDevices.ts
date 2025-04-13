import {
    mysqlTable,
    mysqlEnum,
    varchar,
    timestamp
} from 'drizzle-orm/mysql-core'
import { init } from '@paralleldrive/cuid2'
import {relations} from "drizzle-orm";
import {avalonAuthPermissions} from "@db/schema/avalonAuthPermissions.ts";
import {avalonFcmTokens} from "@db/schema/avalonFcmTokens.ts";

const cuidLength = 20
const cuid = init({ length: cuidLength });

export const avalonDevices = mysqlTable(
    'avalon_devices',
    {
        id: varchar('id', { length: cuidLength })
            .$defaultFn(() => cuid())
            .primaryKey(),
        name: varchar('name', { length: 20 }).notNull(),
        kind: mysqlEnum('kind', ['laptop', 'phone']),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    }
)

export const avalonDevicesRelations = relations(avalonDevices, ({ many }) => ({
    authSources: many(avalonAuthPermissions, { relationName: 'authSources' }),
    authDestinations: many(avalonAuthPermissions, { relationName: 'authDestinations' }),
    fcmTokens: many(avalonFcmTokens),
}))