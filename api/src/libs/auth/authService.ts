import { db } from "@db/index";
import { account } from "@db/schema/auth";
import auth from "@libs/auth/auth";
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";

export default new Elysia({ name: "Auth plugin" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) return status(401);

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
  verifyPassword: {
    async resolve({ status, request: { headers, method }, body }) {
      // check the request method (prevent from dev error)
      if (method !== "POST") return status(400);

      // check that a password is present
      const { password } = body as { password?: string };
      if (
        password === undefined ||
        typeof password !== "string" ||
        password === "" ||
        password.length > 50
      )
        return status(400);

      // get the user session
      const session = await auth.api.getSession({
        headers,
      });
      if (!session) return status(401);

      const userAccount = await db.query.account.findFirst({
        where: eq(account.userId, session.user.id),
      });

      if (userAccount === undefined || userAccount.password === null) return status(401);

      const verify = await (
        await auth.$context
      ).password.verify({ password, hash: userAccount.password });

      if (!verify) return status(401);

      return { user: session.user, session: session.session, password };
    },
  },
  securedAuth: {
    async resolve({ status, cookie, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) return status(401);

      const apiKey = cookie["better-auth.secured_api_key"];

      if (!apiKey || !apiKey.value) return status(403, "secured authentication needed");

      const data = await auth.api.verifyApiKey({
        body: {
          key: apiKey.value,
          permissions: { vault: ["read"] },
        },
      });

      if (data.valid) return { user: session.user, session: session.session };

      if (data.error?.code === "INVALID_API_KEY")
        return status(403, "secured authentication key invalid");

      if (data.error?.code === "USAGE_EXCEEDED")
        return status(403, "secured authentication limit reached");
      return status(403);
    },
  },
  checkPermissions: (permissions: Record<string, string[]>) => ({
    async resolve({ status, request: { headers } }) {
      const apiKey = headers.get("api-key");

      if (apiKey === null) return status(401, 'Missing "api-key" header');

      const verifier = await auth.api.verifyApiKey({
        body: {
          key: apiKey,
          permissions,
        },
      });

      if (!verifier.valid || !verifier.key)
        return status(403, verifier.error?.message ?? "Forbidden");

      return { apiKey: verifier.key };
    },
  }),
});
