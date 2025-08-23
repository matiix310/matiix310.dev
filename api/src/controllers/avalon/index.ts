import Elysia, { t } from "elysia";

import logPlugin from "@plugins/logPlugin";

import avalonDevicesRoute from "./devices";
import avalonClientsRoute from "./clients";
import avalonVaultRoute from "./vault";
import avalonLogsRoute from "./logs";

import authService from "@libs/auth/authService";
import Avalon from "@libs/avalon";

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
    async ({ status, avalon, avalonLogger, apiKey }) => {
      const clientId = apiKey.metadata!["clientId"];
      avalonLogger.log(`(${clientId}) requested an authentication`);

      return new Promise(async (resolve) => {
        await avalon.createAuthSession(clientId, (authorized, reason) => {
          if (!authorized) {
            avalonLogger.error(`Authentication failed! (${reason})`);
            resolve(status(401));
            return;
          }

          avalonLogger.success("Authentication successful!");
          resolve(status(200));
        });
      });
    },
    {
      checkPermissions: {
        avalon: ["request"],
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
  );
