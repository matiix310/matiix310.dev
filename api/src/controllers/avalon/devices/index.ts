import { getDeviceById, getDevices } from "@db/avalonUtils";
import { db } from "@db/index";
import { avalonAuthPermissions } from "@db/schema/avalonAuthPermissions";
import { avalonDevices } from "@db/schema/avalonDevices";
import { avalonFcmTokens } from "@db/schema/avalonFcmTokens";
import auth from "@libs/auth/auth";
import authService from "@libs/auth/authService";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

export const avalonDevice = t.Object({
  id: t.String(),
  name: t.String(),
  kind: t.Union([t.Literal("computer"), t.Literal("laptop"), t.Literal("phone")]),
  fcmToken: t.Optional(t.String()),
  clients: t.Array(t.String()),
  createdAt: t.Date(),
});

export default new Elysia({
  name: "Avalon Devices",
  prefix: "/devices",
})
  .use(authService)
  .model({
    avalonDevice,
    avalonDevicePlusKey: t.Composite([avalonDevice, t.Object({ key: t.String() })]),
  })
  .post(
    "",
    async ({ status, body, user }) => {
      const ids = await db
        .insert(avalonDevices)
        .values({ name: body.name, kind: body.kind })
        .$returningId();

      if (ids.length == 0)
        return status(400, "Can't insert the device into the database");
      const id = ids[0].id;

      const newDevice = await db.query.avalonDevices.findFirst({
        where: eq(avalonDevices.id, id),
        with: {
          permissions: true,
          fcmToken: true,
        },
      });

      if (!newDevice)
        return status(400, "Can't fetch the new device after insertion into the databse");

      // create a new private (.pem) and public (.pub) key
      // const keyFilePath = `${process.env.BASE_FOLDER}${process.env.DEVICES_KEYS_FOLDER}${newDevice.id}`;
      // await $`openssl genpkey -algorithm RSA -out ${keyFilePath}.pem -outpubkey ${keyFilePath}.pub`;
      // const privateKey = await Bun.file(`${keyFilePath}.pem`).text();

      // setup the fcmToken and the clients (permissions)
      const promises = [];

      // add the permissions
      if (body.clients) {
        body.clients.forEach((clientId) => {
          if (!newDevice.permissions.find((p) => p.clientId == clientId))
            promises.push(
              db.insert(avalonAuthPermissions).values({ deviceId: id, clientId })
            );
        });
      }

      if (body.fcmToken) {
        if (newDevice.fcmToken)
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

      return await Promise.all(promises)
        .then(async (_) => {
          const newDeviceAfterEdits = await getDeviceById(id);

          if (!newDeviceAfterEdits) {
            return status(
              500,
              "Error while fetching the device after updating the fcmToken and the clients"
            );
          }

          // generate a new Api key
          const apiKey = await auth.api.createApiKey({
            body: {
              name: "avalon-device-api-key",
              userId: user.id,
              prefix: "avalon-device-api-key",
              rateLimitEnabled: false,
              permissions: {
                avalon: ["answer"],
              },
              metadata: {
                deviceId: newDeviceAfterEdits.id,
              },
            },
          });

          return {
            ...newDeviceAfterEdits,
            // key: privateKey,
            key: apiKey.key,
          };
        })
        .catch((e) => {
          // TODO: replace with logger
          console.error(e);
          return status(500, "Error while setting the fcmToken or the clients");
        });
    },
    {
      securedAuth: true,
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 20 }),
        kind: t.Union([t.Literal("computer"), t.Literal("laptop"), t.Literal("phone")]),
        fcmToken: t.Optional(t.String(/* TODO: set the length of an fcmToken */)),
        clients: t.Optional(t.Array(t.String(/* TODO: set the length of an ID */))),
      }),
      response: {
        200: "avalonDevicePlusKey",
        400: t.Union([
          t.Literal("Can't insert the device into the database"),
          t.Literal("Can't fetch the new device after insertion into the databse"),
          t.String(),
        ]),
        500: t.Union([
          t.Literal("Error while setting the fcmToken or the clients"),
          t.Literal(
            "Error while fetching the device after updating the fcmToken and the clients"
          ),
        ]),
      },
    }
  )
  .get("", () => getDevices(), {
    auth: true,
    response: {
      200: "avalonDevice[]",
    },
  })
  .get(
    "/:id",
    async ({ status, params: { id } }) => {
      const device = await getDeviceById(id);
      if (!device) return status(404, "The device was not found");
      return device;
    },
    {
      auth: true,
      response: { 200: "avalonDevice", 404: t.Literal("The device was not found") },
    }
  )
  .delete(
    "/:id",
    async ({ status, params: { id }, headers }) => {
      const device = await getDeviceById(id);
      if (!device) return status(404, "The device was not found");

      // delete in db
      await db.delete(avalonDevices).where(eq(avalonDevices.id, id));

      // delete the keys
      // await $`rm ${process.env.BASE_FOLDER}${process.env.DEVICES_KEYS_FOLDER}${device.id}*`;

      // detete the api keys
      const apiKeys = await auth.api.listApiKeys({ headers });
      const toDelete = apiKeys.filter(
        (k) => k.metadata === null || k.metadata["deviceId"] === device.id
      );

      await Promise.allSettled(
        toDelete.map(({ id }) =>
          auth.api.deleteApiKey({
            body: { keyId: id },
          })
        )
      );

      return device;
    },
    {
      auth: true,
      response: { 200: "avalonDevice", 404: t.Literal("The device was not found") },
    }
  )
  .post(
    "/:id",
    async ({ status, params: { id }, body }) => {
      // check that the keys can be modified
      const allowed = ["name", "kind", "fcmToken", "clients"];
      for (let key in body)
        if (!allowed.includes(key))
          return status(
            400,
            "You can only edit the following properties: " + allowed.join(", ") + "."
          );

      const device = await db.query.avalonDevices.findFirst({
        where: eq(avalonDevices.id, id),
        with: {
          permissions: true,
          fcmToken: true,
        },
      });

      // device not found
      if (!device) return status(400, "There is no device with the provided id");

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

      if (body.fcmToken !== undefined) {
        if (device.fcmToken !== null) {
          if (body.fcmToken === null)
            promises.push(
              db.delete(avalonFcmTokens).where(eq(avalonFcmTokens.deviceId, id))
            );
          else
            promises.push(
              db
                .update(avalonFcmTokens)
                .set({ fcmToken: body.fcmToken })
                .where(eq(avalonFcmTokens.deviceId, id))
            );
        } else {
          if (body.fcmToken !== null)
            promises.push(
              db.insert(avalonFcmTokens).values({ deviceId: id, fcmToken: body.fcmToken })
            );
        }
      }

      if (body.name)
        promises.push(
          db
            .update(avalonDevices)
            .set({ name: body.name })
            .where(eq(avalonDevices.id, id))
        );

      if (body.kind)
        promises.push(
          db
            .update(avalonDevices)
            .set({ kind: body.kind })
            .where(eq(avalonDevices.id, id))
        );

      return await Promise.all(promises)
        .then(async (p) => {
          const newDevice = await getDeviceById(id);
          if (!newDevice) {
            console.error("Can't return the new devices (was removed?)");
            return status(500, "After modification, there is no device with the same ID");
          }

          return newDevice;
        })
        .catch((e) => {
          console.error(e);
          return status(500, "Error while fetching the new device");
        });
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        kind: t.Optional(
          t.Union([t.Literal("computer"), t.Literal("laptop"), t.Literal("phone")])
        ),
        fcmToken: t.Optional(t.Nullable(t.String())),
        clients: t.Optional(t.Array(t.String())),
      }),
      response: {
        200: "avalonDevice",
        400: t.String(),
        500: t.String(),
      },
    }
  )
  .get(
    "/:id/regenerate-key",
    async ({ status, params: { id }, headers, user }) => {
      const device = await getDeviceById(id);

      if (device === undefined) return status(404, "The device was not found");

      // find the old key
      const key = (await auth.api.listApiKeys({ headers })).find(
        (k) => k.metadata!["deviceId"] === device.id
      );

      if (key !== undefined) {
        // delete the old key
        await auth.api.deleteApiKey({
          body: {
            keyId: key.id,
          },
          headers,
        });
      }

      // create a new key
      const newKey = await auth.api.createApiKey({
        body: {
          name: "avalon-device-api-key",
          userId: user.id,
          prefix: "avalon-device-api-key",
          rateLimitEnabled: false,
          permissions: {
            avalon: ["answer"],
          },
          metadata: {
            deviceId: device.id,
          },
        },
      });

      return { key: newKey.key };
    },
    {
      securedAuth: true,
      response: {
        200: t.Object({ key: t.String() }),
        404: t.Literal("The device was not found"),
      },
    }
  );
