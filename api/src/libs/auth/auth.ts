import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@db/index.ts";
import { account, session, user, verification, apikey } from "@db/schema/auth";
import { apiKey, username } from "better-auth/plugins";

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user,
      session,
      verification,
      account,
      apikey,
    },
  }),
  emailAndPassword: {
    enabled: true,
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
  ],
  trustedOrigins: ["http://localhost", "http://localhost:3000", "https://matiix310.dev"],
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
