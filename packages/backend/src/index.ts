import Elysia from "elysia";
import { BunFile } from "bun";

import swagger from "@elysiajs/swagger";

import logPlugin, { Logger } from "@plugins/logPlugin";
import reactPlugin from "@plugins/reactPlugin";

import middlewarePlugin from "@libs/middlewarePlugin";

import curlRoute from "@controllers/curl";
import downloadsRoute from "@controllers/downloads";
import uploadRoute from "@controllers/upload";
import discordSpyRoute from "@controllers/discordSpy";
import musixRoute from "@controllers/musix";
import avalonRoute from "@controllers/avalon";
import loginLogoutRoute from "@controllers/loginLogout";
import apiRoute from "@controllers/api";

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
            "This is the Scalar map of the wabsite matiix310.dev. The website is still in development and this map is not exhaustive.",
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
  .use(avalonRoute)
  .use(loginLogoutRoute)
  .use(apiRoute)
  .use(
    reactPlugin({
      url: "/",
      path: Bun.env.BACKEND_BASE_FOLDER! + "../frontend-cv/dist/",
      description: "the frontpage of the website. Currenty my personal sumary",
    })
  )
  .listen(serverConfig, (server) => {
    const logger = new Logger("Start");
    logger.log(`🦊 Elysia is running at ${server.url.href} on port ${server.url.port}`);
  });
