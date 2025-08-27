import Elysia, { t } from "elysia";

import logPlugin from "@plugins/logPlugin";

import avalonDevicesRoute from "./devices";
import avalonClientsRoute from "./clients";
import avalonVaultRoute from "./vault";
import avalonLogsRoute from "./logs";

import authService from "@libs/auth/authService";
import Avalon from "@libs/avalon";
import { db } from "@db/index";
import { eq, or } from "drizzle-orm";
import { avalonVault } from "@db/schema/avalonVault";

import { avalonVaultEntry } from "./vault/index";

export default new Elysia({
  name: "Avalon Route",
  prefix: "/avalon",
  detail: { tags: ["Avalon"] },
})
  .use(logPlugin("Avalon").prefix("decorator", "avalon"))
  .decorate((decorators) => ({
    avalon: new Avalon(decorators.avalonLogger),
    ...decorators,
  }))
  .use(avalonDevicesRoute)
  .use(avalonClientsRoute)
  .use(avalonVaultRoute)
  .use(avalonLogsRoute)
  .use(authService)
  .get(
    "/request",
    async ({ status, avalon, avalonLogger, apiKey, query: { ids } }) => {
      if (ids !== undefined) {
        const searchIds = ids.split(",");
        const vaultEntries = await db.query.avalonVault.findMany({
          where: or(...searchIds.map((id) => eq(avalonVault.id, id))),
        });
        return vaultEntries.map((entry) => ({
          id: entry.id,
          kind: entry.kind,
          content: entry.content,
        }));
      } else {
        const clientId = apiKey.metadata!["clientId"];
        avalonLogger.log(`(${clientId}) requested an authentication`);

        return new Promise(async (resolve) => {
          await avalon.createAuthSession(clientId, (authorized, reason) => {
            if (!authorized) {
              avalonLogger.error(`Authentication failed! (${reason})`);
              resolve(status(401, "Unauthorized"));
              return;
            }

            avalonLogger.success("Authentication successful!");
            resolve(status(200, "OK"));
          });
        });
      }
    },
    {
      checkPermissions: {
        avalon: ["request"],
      },
      query: t.Object({
        ids: t.Optional(t.String()),
      }),
      response: {
        200: t.Union([
          t.Literal("OK"),
          t.Array(
            t.Object({
              id: avalonVaultEntry.properties.id,
              kind: avalonVaultEntry.properties.kind,
              content: t.String(),
            })
          ),
        ]),
        401: t.Union([t.Literal("Unauthorized")]),
      },
    }
  )
  .post(
    "/answer",
    async ({ body, avalon, avalonLogger, apiKey }) => {
      const deviceId = apiKey.metadata!["deviceId"];
      avalonLogger.log(`(${body.id}) is trying to answer`);

      avalonLogger.log("Answered successfully");
      return avalon.authorizeSession(body.id, deviceId, body.answer);
    },
    {
      checkPermissions: {
        avalon: ["answer"],
      },
      body: t.Object({
        id: t.String(),
        answer: t.Boolean(),
        date: t.Number(),
      }),
    }
  )
  .get(
    "/search/:hostname",
    async ({ params: { hostname } }) => {
      const entries = await db.query.avalonVault.findMany({
        columns: { id: true, uriRegex: true, kind: true },
      });
      return entries.filter((entry) => new RegExp(entry.uriRegex).test(hostname));
    },
    {
      checkPermissions: {
        avalon: ["request"],
      },
      params: t.Object({
        hostname: t.String(),
      }),
      response: {
        200: t.Array(
          t.Object({
            id: avalonVaultEntry.properties.id,
            uriRegex: avalonVaultEntry.properties.uriRegex,
            kind: avalonVaultEntry.properties.kind,
          })
        ),
      },
    }
  );
