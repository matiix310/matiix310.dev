import Elysia from "elysia";
import logPlugin from "@plugins/logPlugin";

export default new Elysia()
  .use(logPlugin("Middleware").prefix("decorator", "middleware"))
  .onRequest(({ request, middlewareLogger }) => {
    middlewareLogger.log(`${request.method} ${request.url}`);
  });
