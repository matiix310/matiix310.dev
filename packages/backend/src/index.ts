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

import "./db/index";

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
    })
  )
  .listen(process.env.PORT ?? 8000, (server) => {
    const logger = new Logger("Start");
    logger.log(`🦊 Elysia is running at ${server.url.href}`);
  });
