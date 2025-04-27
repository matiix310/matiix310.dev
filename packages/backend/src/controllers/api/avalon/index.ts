import Elysia, { error, t } from "elysia";

import logPlugin from "@plugins/logPlugin";
import authService from "@libs/auth/authService";

import Avalon from "@libs/avalon";
import sshValidate from "@libs/sshValidate";

import { db } from "@db/index";
import { and, eq } from "drizzle-orm";
import { avalonFcmTokens } from "@db/schema/avalonFcmTokens";
import { avalonLogs } from "@db/schema/avalonLogs";
import { avalonDevices } from "@db/schema/avalonDevices";
import { avalonClients } from "@db/schema/avalonClients";
import { avalonAuthPermissions } from "@db/schema/avalonAuthPermissions";
import { getClientById, getClients, getDeviceById, getDevices } from "@db/avalonUtils";

export default new Elysia({
  name: "Avalon api route",
  prefix: "/avalon",
  detail: { tags: ["Avalon Api"] },
})
  .use(logPlugin("Avalon api").prefix("decorator", "avalonApi"))
  .use(authService)
  .decorate((decorators) => ({
    avalon: new Avalon(decorators.avalonApiLogger),
    ...decorators,
  }))
  .model({
    avalonDevice: t.Object({
      id: t.String(),
      name: t.String(),
      kind: t.Union([t.Literal("laptop"), t.Literal("phone")]),
      fcmToken: t.Nullable(t.String()),
      clients: t.Array(t.String()),
      createdAt: t.Date(),
    }),
    avalonClient: t.Object({
      id: t.String(),
      name: t.String(),
      kind: t.Union([t.Literal("web_extension"), t.Literal("pam")]),
      createdAt: t.Date(),
    }),
    avalonLog: t.Object({
      deviceId: t.String(),
      clientId: t.String(),
      success: t.Boolean(),
      date: t.Date(),
    }),
  })
  .get(
    "/request",
    async ({ query, set, avalon, avalonApiLogger }) => {
      avalonApiLogger.log(`(${query.id}) requested an authentication`);

      if (!sshValidate(query.id, query.data, query.signature, true)) {
        avalonApiLogger.log(`(${query.id}) request aborted (invalid signature)`);
        set.status = 401;
        return {
          error: true,
          message: "Invalid signature, authentication failed",
        };
      }

      return new Promise(async (resolve) => {
        await avalon.createAuthSession(query.id!, (authorized) => {
          set.status = authorized ? 200 : 401;
          if (authorized) avalonApiLogger.success("Authentication successful!");
          else avalonApiLogger.error("Authentication failed!");
          resolve(new Response());
        });
      });
    },
    {
      query: t.Object({
        id: t.String(),
        data: t.String(),
        signature: t.String(),
      }),
    }
  )
  .post(
    "/answer",
    async ({ body, avalon, set, avalonApiLogger }) => {
      avalonApiLogger.log(`(${body.id}) is trying to answer`);

      console.log("Signature:", body.signature.toString());

      if (!sshValidate(body.id, body.data, body.signature)) {
        avalonApiLogger.log(`(${body.id}) request aborted (invalid signature)`);
        set.status = 401;
        return {
          error: true,
          message: "Invalid signature, authentication failed",
        };
      }

      let answer: boolean | undefined;
      let sourceId: string | undefined;

      try {
        const data = JSON.parse(body.data);
        answer = data["answer"];
        sourceId = data["sourceId"];
      } catch (err) {
        avalonApiLogger.log("Error while parsing data from body:", err);
        return { error: true, message: "invalid data" };
      }

      if (answer == undefined || !sourceId)
        return { error: true, message: "Malformed query" };

      avalonApiLogger.log("Answered successfully");
      return avalon.authorizeSession(sourceId, body.id, answer);
    },
    {
      body: t.Object({
        id: t.String(),
        data: t.String(),
        signature: t.String(),
      }),
    }
  )
  // .post(
  //   "/devices",
  //   async ({ body, set, avalonApiLogger }) => {
  //     avalonApiLogger.log(`(${body.id}) requested a token update`);

  //     if (!sshValidate(body.id, body.data, body.signature)) {
  //       avalonApiLogger.log(`(${body.id}) request aborted (invalid signature)`);
  //       set.status = 401;
  //       return {
  //         error: true,
  //         message: "Invalid signature, authentication failed",
  //       };
  //     }

  //     const fcmTokens = await db
  //       .select()
  //       .from(avalonFcmTokens)
  //       .where(eq(avalonFcmTokens.deviceId, body.id))
  //       .catch((err) => {
  //         avalonApiLogger.error(err);
  //       });

  //     if (!fcmTokens) return;

  //     let error = false;
  //     if (fcmTokens.length == 0)
  //       await db
  //         .insert(avalonFcmTokens)
  //         .values({ deviceId: body.id, fcmToken: body.data })
  //         .catch((err) => {
  //           error = true;
  //           avalonApiLogger.error(err);
  //         });
  //     else
  //       await db
  //         .update(avalonFcmTokens)
  //         .set({ fcmToken: body.data })
  //         .where(eq(avalonFcmTokens.deviceId, body.id))
  //         .catch((err) => {
  //           error = true;
  //           avalonApiLogger.error(err);
  //         });

  //     if (error) set.status = 500;

  //     return { error };
  //   },
  //   {
  //     body: t.Object({
  //       id: t.String(),
  //       data: t.String(),
  //       signature: t.String(),
  //     }),
  //   }
  // )
  .post(
    "/devices",
    async ({ body }) => {
      const ids = await db
        .insert(avalonDevices)
        .values({ name: body.name })
        .$returningId();

      if (ids.length == 0) return error(400, "Can't insert the device into the database");

      const newDevice = await getDeviceById(ids[0].id);

      if (!newDevice)
        return error(400, "Can't fetch the new device after insertion into the databse");

      return newDevice;
    },
    {
      auth: true,
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 20 }),
      }),
      response: {
        200: "avalonDevice",
        400: t.Union([
          t.Literal("Can't insert the device into the database"),
          t.Literal("Can't fetch the new device after insertion into the databse"),
        ]),
      },
    }
  )
  .get(
    "/logs",
    () => {
      return db
        .select({
          deviceId: avalonLogs.deviceId,
          deviceName: avalonDevices.name,
          clientId: avalonLogs.clientId,
          clientName: avalonClients.name,
          success: avalonLogs.success,
          date: avalonLogs.date,
        })
        .from(avalonLogs)
        .leftJoin(avalonDevices, eq(avalonLogs.deviceId, avalonDevices.id))
        .leftJoin(avalonClients, eq(avalonLogs.clientId, avalonClients.id));
    },
    {
      auth: true,
      response: {
        200: "avalonLog[]",
      },
    }
  )
  .post(
    "/clients",
    async ({ body }) => {
      const ids = await db
        .insert(avalonClients)
        .values({ name: body.name })
        .$returningId();

      if (ids.length == 0) return error(400, "Can't insert the client into the database");

      const newClient = await getClientById(ids[0].id);

      if (!newClient)
        return error(400, "Can't fetch the new client after insertion into the databse");

      return newClient;
    },
    {
      auth: true,
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 20 }),
      }),
      response: {
        200: "avalonClient",
        400: t.Union([
          t.Literal("Can't insert the client into the database"),
          t.Literal("Can't fetch the new client after insertion into the databse"),
        ]),
      },
    }
  )
  .get("/clients", () => getClients(), {
    auth: true,
    response: {
      200: "avalonClient[]",
    },
  })
  .get(
    "/clients/:id",
    async ({ params: { id } }) => {
      const client = await getClientById(id);
      if (!client) return error(404, "The client was not found");
      return client;
    },
    {
      auth: true,
      response: { 200: "avalonClient", 404: t.Literal("The client was not found") },
    }
  )
  .post(
    "/clients/:id",
    async ({ params: { id }, body, avalonApiLogger }) => {
      // check that the keys can be modified
      const allowed = ["name", "kind"];
      for (let key in body)
        if (!allowed.includes(key))
          return error(
            400,
            "You can only edit the following properties: [" + allowed.join(", ") + "]"
          );

      const client = await db.query.avalonClients.findFirst({
        where: eq(avalonClients.id, id),
      });

      // client not found
      if (!client) return error(400, "There is no clients with the provided id");

      const promises = [];

      if (body.name || body.kind)
        promises.push(db.update(avalonClients).set(body).where(eq(avalonClients.id, id)));

      return await Promise.all(promises)
        .then(async (_) => {
          const newClient = await getClientById(id);
          if (!newClient)
            return error(500, "After modification, there is no client with the same ID");

          return newClient;
        })
        .catch((e) => {
          avalonApiLogger.error(e);
          return error(500, "Error while fetching the new client");
        });
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
        kind: t.Optional(t.Union([t.Literal("web_extension"), t.Literal("pam")])),
      }),
      response: {
        200: "avalonClient",
        400: t.String(),
        500: t.String(),
      },
    }
  )
  .get("/devices", () => getDevices(), {
    auth: true,
    response: {
      200: "avalonDevice[]",
    },
  })
  .get(
    "/devices/:id",
    async ({ params: { id } }) => {
      const device = await getDeviceById(id);
      if (!device) return error(404, "The device was not found");
      return device;
    },
    {
      auth: true,
      response: { 200: "avalonDevice", 404: t.Literal("The device was not found") },
    }
  )
  .post(
    "/devices/:id",
    async ({ params: { id }, body }) => {
      // check that the keys can be modified
      const allowed = ["name", "fcmToken", "clients"];
      for (let key in body)
        if (!allowed.includes(key))
          return error(
            400,
            "You can only edit the following properties: [" + allowed.join(", ") + "]"
          );

      const device = await db.query.avalonDevices.findFirst({
        where: eq(avalonDevices.id, id),
        with: {
          permissions: true,
          fcmToken: true,
        },
      });

      // device not found
      if (!device) return error(400, "There is no device with the provided id");

      const promises = [];

      // update the permissions
      if (body.clients) {
        // insert
        body.clients.forEach((clientId) => {
          if (!device.permissions.find((p) => p.clientId == clientId))
            promises.push(
              db.insert(avalonAuthPermissions).values({ deviceId: id, clientId })
            );
        });

        // remove
        device.permissions.forEach((c) => {
          if (!body.clients!.find((clientId) => c.clientId == clientId))
            promises.push(
              db
                .delete(avalonAuthPermissions)
                .where(
                  and(
                    eq(avalonAuthPermissions.deviceId, id),
                    eq(avalonAuthPermissions.clientId, c.clientId)
                  )
                )
            );
        });
      }

      if (body.fcmToken) {
        if (device.fcmToken)
          promises.push(
            db
              .update(avalonFcmTokens)
              .set({ fcmToken: body.fcmToken })
              .where(eq(avalonFcmTokens.deviceId, id))
          );
        else
          promises.push(
            db.insert(avalonFcmTokens).values({ deviceId: id, fcmToken: body.fcmToken })
          );
      }

      if (body.name)
        promises.push(
          db
            .update(avalonDevices)
            .set({ name: body.name })
            .where(eq(avalonDevices.id, id))
        );

      return await Promise.all(promises)
        .then(async (p) => {
          const newDevice = await getDeviceById(id);
          if (!newDevice) {
            console.error("Can't return the new devices (was removed?)");
            return error(500, "After modification, there is no device with the same ID");
          }

          return newDevice;
        })
        .catch((e) => {
          console.error(e);
          return error(500, "Error while fetching the new device");
        });
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        fcmToken: t.Optional(t.String()),
        clients: t.Optional(t.Array(t.String())),
      }),
      response: {
        200: "avalonDevice",
        400: t.String(),
        500: t.String(),
      },
    }
  );
