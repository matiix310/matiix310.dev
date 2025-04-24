import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";

import logPlugin, { Logger } from "@libs/logPlugin";
import middlewarePlugin from "@libs/middlewarePlugin";

import curlRoute from "@controllers/curl";
import downloadsRoute from "@controllers/downloads";
import uploadRoute from "@controllers/upload";
import discordSpyRoute from "@controllers/discordSpy";
import musixRoute from "@controllers/musix";
import avalonRoute from "@controllers/avalon";
import authRoute from "@controllers/auth";

import { BunFile } from "bun";
import { auth } from "@libs/auth/auth";

const serverConfig: { port: number; tls?: { key: BunFile; cert: BunFile } } = {
  port: process.env.PORT ?? 8000,
};

if (process.env.TLS)
  serverConfig.tls = {
    key: Bun.file("cert/key.pem"),
    cert: Bun.file("cert/cert.pem"),
  };

export const app = new Elysia()
  .use(logPlugin("Main"))
  .use(middlewarePlugin)
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ error, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return error(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .use(curlRoute)
  .use(downloadsRoute)
  .use(uploadRoute)
  .use(discordSpyRoute)
  .use(musixRoute)
  .use(avalonRoute)
  .use(authRoute)
  .use(
    staticPlugin({
      assets: process.env.BACKEND_BASE_FOLDER! + "../frontend-cv/dist/",
      prefix: "/",
      alwaysStatic: false,
    })
  )
  .listen(serverConfig, (server) => {
    const logger = new Logger("Start");
    logger.log(`🦊 Elysia is running at ${server.url.href} on port ${server.url.port}`);
  });
