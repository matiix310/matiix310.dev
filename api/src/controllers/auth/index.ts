import Elysia, { t } from "elysia";

import betterAuthView from "@libs/auth/auth-view";
import logPlugin from "@plugins/logPlugin";
import authPlugin from "@libs/auth/authService";
import auth from "@libs/auth/auth";
// import auth from "@libs/auth/auth";

export default new Elysia({
  name: "Auth route",
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
    description: "Custom endoints for the website authentication system",
  },
})
  .use(logPlugin("Auth").prefix("decorator", "auth"))
  .use(authPlugin)
  .get(
    "/ping",
    ({ user, session }) => ({
      user,
      session,
    }),
    { auth: true }
  )
  .get("/ping-ota", ({ user, session }) => ({ user, session }), {
    auth: true,
    oneTimeAuth: true,
  })
  .post(
    "/secured-api-key",
    async ({ status, set, user }) => {
      try {
        const { key } = await auth.api.createApiKey({
          body: {
            name: "vault-api-key",
            expiresIn: 60 * 3, // 3 minutes
            userId: user.id,
            prefix: "vault-api-key",
            remaining: 3,
            rateLimitEnabled: false,
            permissions: {
              vault: ["read"],
            },
          },
        });
        set.cookie = {
          "better-auth.secured_api_key": {
            value: key,
            maxAge: 60 * 3,
            path: "/",
            httpOnly: true,
            sameSite: "lax",
          },
        };
        return status(200);
      } catch (e) {
        console.error(e);
      }

      return status(500);
    },
    {
      verifyPassword: true,
    }
  )
  .post(
    "/setup-2fa",
    async ({ headers, password, user }) => {
      return auth.api.enableTwoFactor({
        body: {
          password,
        },
        headers,
        asResponse: true,
      });
    },
    {
      verifyPassword: true,
    }
  )
  .post(
    "/trigger-2fa",
    async ({ headers, body: { code } }) => {
      return auth.api.verifyTOTP({
        body: {
          code,
        },
        headers,
        asResponse: true,
      });
    },
    {
      auth: true,
      body: t.Object({
        code: t.RegExp(/^\d{6}$/),
      }),
    }
  )
  // .get("/give", async () => {
  //   return await auth.api.signUpEmail({
  //     asResponse: true,
  //     body: {
  //       email: "admin@matiix310.dev",
  //       name: "admin",
  //       password: "password",
  //       username: "admin",
  //     },
  //   });
  // })
  .all("/*", betterAuthView);
