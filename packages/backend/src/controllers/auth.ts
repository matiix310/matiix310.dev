import Elysia, { t } from "elysia";
import Stream from "@libs/stream";
import fs from "fs";
import logPlugin, { Logger } from "@libs/logPlugin";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import Auth from "@libs/auth";
import { jwt } from "@elysiajs/jwt";

export default new Elysia({ name: "auth", prefix: "/auth" })
  .use(logPlugin("Auth").prefix("decorator", "auth"))
  .decorate((decorators) => ({
    auth: new Auth(decorators.authLogger),
    ...decorators,
  }))
  .use(
    jwt({
      name: "jwt",
      secret: "Fischl von Luftschloss Narfidort",
    })
  )
  .get("/request/:user", async ({ request, params: { user }, set, auth, authLogger }) => {
    return new Promise((resolve) => {
      const id = auth.createAuthSession(user, (authorized) => {
        set.status = authorized ? 200 : 401;
        if (authorized) authLogger.success("Authentication successful!");
        else authLogger.error("Authentication failed!");
        resolve("");
      });
    });
  })
  .ws("/ws", {
    // beforeHandle({ jwt, set, cookie: { auth } }) {
    //   const profile = jwt.verify(auth.value);
    //   if (!profile) set.status = 401;
    //   return "Unauthorized";
    transform({ query }) {
      query.message = query["message"] ? JSON.parse(query["message"]) : "";
    },
    open(ws) {
      const auth = ws.data.auth;
      ws.subscribe("phones");
      auth.addSocket(ws.id, ws.send);
    },
    close(ws) {
      const auth = ws.data.auth;
      auth.removeSocket(ws.id);
    },
    body: t.Object({
      message: t.Union([
        t.Object({
          action: t.Literal("authorize"),
          data: t.Object({
            id: t.String(),
            authorize: t.Boolean(),
          }),
        }),
        t.Object({
          action: t.Literal("ping"),
        }),
        t.Undefined(),
      ]),
    }),
    response: t.String(),
    message(ws, { message }) {
      const auth = ws.data.auth;

      if (!message) return;

      switch (message.action) {
        case "authorize":
          if (ws.isSubscribed("phones")) {
            const r = auth.authorizeSession(message.data.id, message.data.authorize);
            ws.send(JSON.stringify(r));
          } else {
            ws.send("You are not allowed to use this action");
          }
          break;
        case "ping":
          ws.send("pong");
      }
    },
  });
