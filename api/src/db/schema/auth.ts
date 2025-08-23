import {
  boolean,
  date,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  username: text("username"),
  displayUsername: text("displayUsername"),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 })
    .references(() => user.id)
    .notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: text("ipAdress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 })
    .references(() => user.id)
    .notNull(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  idToken: text("idtoken"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 64 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const apikey = mysqlTable("api_key", {
  id: varchar("id", { length: 64 }).primaryKey(), // The ID of the API key.
  name: text("name"), // The name of the API key.
  start: text("start"), // The starting characters of the API key. Useful for showing the first few characters of the API key in the UI for the users to easily identify.
  prefix: text("prefix"), // The API Key prefix. Stored as plain text.
  key: text("key").notNull(), //	The hashed API key itself.
  userId: varchar("user_id", { length: 64 }) // The ID of the user associated with the API key.
    .references(() => user.id)
    .notNull(),
  refillInterval: int("refill_interval"), // The interval to refill the key in milliseconds.
  refillAmount: int("refill_amount"), // The amount to refill the remaining count of the key.
  lastRefillAt: timestamp("last_refill_at", { mode: "date" }), // The date and time when the key was last refilled.
  enabled: boolean("enabled").notNull(), // Whether the API key is enabled.
  rateLimitEnabled: boolean("rate_limit_enabled").notNull(), //	Whether the API key has rate limiting enabled.
  rateLimitTimeWindow: int("rate_limit_time_window"), // The time window in milliseconds for the rate limit.
  rateLimitMax: int("rate_limit_max"), // The maximum number of requests allowed within the `rateLimitTimeWindow`.
  requestCount: int("request_count").notNull(), // The number of requests made within the rate limit time window.
  remaining: int("remaining"), // The number of requests remaining.
  lastRequest: timestamp("last_request", { mode: "date" }), // The date and time of the last request made to the key.
  expiresAt: timestamp("expires_at", { mode: "date" }), // The date and time when the key will expire.
  createdAt: timestamp("created_at", { mode: "date" }).notNull(), // The date and time the API key was created.
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(), // The date and time the API key was updated.
  permissions: text("permissions"), // The permissions of the key.
  metadata: json("metadata"), // Any additional metadata you want to store with the key.
});
