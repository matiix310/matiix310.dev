import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";

import logPlugin, { Logger } from "@libs/logPlugin";
import middlewarePlugin from "@libs/middlewarePlugin";

import curlRoute from "@controllers/curl";
import downloadsRoute from "@controllers/downloads";
import uploadRoute from "@controllers/upload";
import discordSpyRoute from "@controllers/discordSpy";
import musixRoute from "@controllers/musix";
import authRoute from "@controllers/auth";
import { BunFile } from "bun";

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
  .use(curlRoute)
  .use(downloadsRoute)
  .use(uploadRoute)
  .use(discordSpyRoute)
  .use(musixRoute)
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
