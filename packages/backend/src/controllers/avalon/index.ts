import Elysia from "elysia";

// import logPlugin from "@plugins/logPlugin";
// import authService from "@libs/auth/authService";
import reactPlugin from "@plugins/reactPlugin";

export default new Elysia({ name: "avalon", prefix: "/avalon" })
  // .use(logPlugin("Avalon").prefix("decorator", "avalon"))
  // .use(authService)
  .use(
    reactPlugin({
      url: "/",
      path: Bun.env.BACKEND_BASE_FOLDER! + "../frontend-avalon/dist/",
      description: "The admin panel of the Avalon authentication system",
    })
  );
