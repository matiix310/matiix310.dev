import Elysia from "elysia";
import logPlugin from "@libs/logPlugin";

export default new Elysia()
  .use(logPlugin("Middleware").prefix("decorator", "middleware"))
  .onRequest(({ request, middlewareLogger }) => {
    middlewareLogger.log(`${request.method} ${request.url}`);
  });
