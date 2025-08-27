import Elysia from "elysia";
import logPlugin from "@plugins/logPlugin";

export default new Elysia()
  .use(logPlugin("Middleware").prefix("decorator", "middleware"))
  .onRequest(({ server, request, middlewareLogger }) => {
    // made to be behind a cloudflare proxy
    middlewareLogger.log(
      `[${
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-real-ip") ??
        server?.requestIP(request)?.address ??
        "unknown ip"
      }] ${request.method} ${request.url}`
    );
  });
