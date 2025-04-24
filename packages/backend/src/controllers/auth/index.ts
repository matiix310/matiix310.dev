import betterAuthView from "@libs/auth/auth-view";
import logPlugin from "@libs/logPlugin";
import Elysia from "elysia";

export default new Elysia({ name: "auth", prefix: "/auth" })
  .use(logPlugin("Auth").prefix("decorator", "auth"))
  .get("/ping", () => {
    return "pong";
  })
  .all("/*", betterAuthView);
