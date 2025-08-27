import Elysia from "elysia";

import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";

import logPlugin, { Logger } from "@plugins/logPlugin";
import middlewarePlugin from "@plugins/middlewarePlugin";

import curlRoute from "@controllers/curl";
import downloadsRoute from "@controllers/downloads";
import uploadRoute from "@controllers/upload";
import discordSpyRoute from "@controllers/discordSpy";
import musixRoute from "@controllers/musix";
import avalonRoute from "@controllers/avalon";
import authRoute from "@controllers/auth";

const serverConfig: { port: number } = {
  port: process.env.PORT ?? 8000,
};

export const app = new Elysia({
  prefix: "/api",
})
  .use(logPlugin("Main"))
  .use(cors())
  .use(
    swagger({
      excludeStaticFile: true,
      exclude: ["/api/auth/give"],
      documentation: {
        tags: [
          {
            name: "Static",
            description: "All the static frontend routes",
          },
          {
            name: "Avalon Api",
            description: "Endoints for the Avalon authentication system",
          },
          {
            name: "Auth Api",
            description: "Sebug endpoints for the website authentication system",
          },
          {
            name: "Curl",
            description:
              "You can use the curl command line tool to fetch these endpoints and get some cool animations",
          },
          {
            name: "Discord Spy",
            description: "A nice little endpoint without any suspicious effect",
          },
        ],
        info: {
          title: "Matiix310 Scalar",
          version: "1.0.0",
          contact: { email: "contact@matiix310.dev" },
          description:
            "This is the Scalar map of the website matiix310.dev. The website is still in development and this map is not exhaustive.",
        },
      },
    })
  )
  .use(middlewarePlugin)
  .use(curlRoute)
  .use(downloadsRoute)
  .use(uploadRoute)
  .use(discordSpyRoute)
  .use(musixRoute)
  .use(authRoute)
  .use(avalonRoute)
  .listen({ ...serverConfig, idleTimeout: 60 }, (server) => {
    const logger = new Logger("Start");
    logger.log(`🦊 Elysia is running at ${server.url.href} on port ${server.url.port}`);
  });
