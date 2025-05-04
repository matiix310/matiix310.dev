import Elysia from "elysia";

import betterAuthView from "@libs/auth/auth-view";
import logPlugin from "@plugins/logPlugin";
import authPlugin from "@libs/auth/authService";
// import auth from "@libs/auth/auth";

export default new Elysia({
  name: "Auth route",
  prefix: "/auth",
  detail: {
    tags: ["Auth Api"],
    description: "Debug endoints for the website authentication system",
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
  /* .get("/give", async () => {
    return await auth.api.signUpEmail({
      asResponse: true,
      body: {
        email: "admin@matiix310.dev",
        name: "admin",
        password: "password",
        username: "admin",
      },
    });
  }) */
  .all("/*", betterAuthView);
