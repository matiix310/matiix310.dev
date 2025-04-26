import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@db/index.ts";
import { account, session, user, verification } from "@db/schema/auth";
import { username } from "better-auth/plugins";

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user,
      session,
      verification,
      account,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
});

export default auth;
