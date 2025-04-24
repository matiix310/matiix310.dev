import { boolean, date, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  username: text("username"),
  displayUsername: text("displayUsername"),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: date("createdAt").notNull(),
  updatedAt: date("updatedAt").notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 })
    .references(() => user.id)
    .notNull(),
  token: text("token").notNull(),
  expiresAt: date("expiresAt").notNull(),
  ipAddress: text("ipAdress"),
  userAgent: text("userAgent"),
  createdAt: date("createdAt").notNull(),
  updatedAt: date("updatedAt").notNull(),
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
  accessTokenExpiresAt: date("accessTokenExpiresAt"),
  refreshTokenExpiresAt: date("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idtoken"),
  password: text("string"),
  createdAt: date("createdAt").notNull(),
  updatedAt: date("updatedAt").notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 64 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: date("expiresAt").notNull(),
  createdAt: date("createdAt").notNull(),
  updatedAt: date("updatedAt").notNull(),
});
