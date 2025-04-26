import { eq } from "drizzle-orm";
import { db } from ".";
import { avalonDevices } from "./schema/avalonDevices";
import { avalonClients } from "./schema/avalonClients";

export const getDevices = async () => {
  const res = await db.query.avalonDevices.findMany({
    with: {
      permissions: {
        columns: {
          clientId: true,
        },
      },
      fcmToken: {
        columns: {
          fcmToken: true,
        },
      },
    },
  });

  return res.map(({ id, name, kind, createdAt, permissions, fcmToken }) => ({
    id,
    name,
    kind,
    createdAt,
    clients: permissions.map((p) => p.clientId),
    fcmToken: fcmToken ? fcmToken.fcmToken : null,
  }));
};

export const getDeviceById = async (deviceId: string) => {
  const device = await db.query.avalonDevices.findFirst({
    where: eq(avalonDevices.id, deviceId),
    with: {
      permissions: {
        columns: {
          clientId: true,
        },
      },
      fcmToken: {
        columns: {
          fcmToken: true,
        },
      },
    },
  });

  if (!device) return null;

  return {
    id: device.id,
    name: device.name,
    kind: device.kind,
    createdAt: device.createdAt,
    clients: device.permissions.map((p) => p.clientId),
    fcmToken: device.fcmToken ? device.fcmToken.fcmToken : null,
  };
};

export const getClients = async () => db.select().from(avalonClients);

export const getClientById = async (clientId: string) =>
  db.query.avalonClients.findFirst({ where: eq(avalonClients.id, clientId) });
