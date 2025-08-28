import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@db/index.ts";
import {
  account,
  session,
  user,
  verification,
  apikey,
  twoFactor as twoFactorTable,
} from "@db/schema/auth";
import { apiKey, username, twoFactor } from "better-auth/plugins";

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user,
      session,
      verification,
      account,
      apikey,
      twoFactor: twoFactorTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  telemetry: {
    enabled: false,
  },
  plugins: [
    username(),
    apiKey({
      apiKeyHeaders: [],
      keyExpiration: {
        minExpiresIn: 0,
      },
      enableMetadata: true,
    }),
    twoFactor({
      issuer: "matiix310.dev",
    }),
  ],
  trustedOrigins: ["http://localhost:8000", "https://matiix310.dev"],
  advanced: {
    // defaultCookieAttributes: {
    //   httpOnly: true,
    //   path: "/",
    //   sameSite: "none",
    //   secure: false,
    // },
  },
});

export default auth;
