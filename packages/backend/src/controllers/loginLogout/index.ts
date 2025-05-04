import auth from "@libs/auth/auth";
import reactPlugin from "@plugins/reactPlugin";
import Elysia from "elysia";

export default new Elysia()
  .get("/logout", ({ request: { headers } }) =>
    auth.api.signOut({ asResponse: true, headers })
  )
  .use(
    reactPlugin({
      url: "/login/",
      path: Bun.env.BACKEND_BASE_FOLDER! + "../frontend-auth/dist/",
      description: "The login page of the website",
    })
  );
