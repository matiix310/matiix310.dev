import { Logger } from "@plugins/logPlugin";
import { CanBeError } from "matiix";
import { db } from "@db/index.ts";
import { eq } from "drizzle-orm";
import { avalonAuthPermissions } from "@db/schema/avalonAuthPermissions";
import { avalonFcmTokens } from "@db/schema/avalonFcmTokens.ts";
import { initializeApp } from "firebase-admin/app";
import { getMessaging, type Message } from "firebase-admin/messaging";
import { avalonClients } from "@db/schema/avalonClients";
import { avalonLogs } from "@db/schema/avalonLogs";

type Session = {
  cb: (authenticated: boolean, reason: string) => void;
  clientId: string;
  devicesId: string[];
  start: number;
};

const validityTime = 20; // in seconds

export default class Avalon {
  private logger;
  private app;

  private sessions: Record<string, Session> = {};

  constructor(logger: Logger) {
    this.logger = logger;
    this.app = initializeApp();
  }

  async createAuthSession(clientId: string, cb: Session["cb"]): Promise<void> {
    if (this.sessions[clientId]) {
      cb(false, "session already exists");
      return;
    }

    // check if the client exists
    const client = await db.query.avalonClients.findFirst({
      where: eq(avalonClients.id, clientId),
    });

    if (!client) {
      cb(false, "Not a known client ID");
      return;
    }

    // Fetch all the devices that can authorize this session
    db.select({
      deviceId: avalonAuthPermissions.deviceId,
      fcmToken: avalonFcmTokens.fcmToken,
    })
      .from(avalonAuthPermissions)
      .where(eq(avalonAuthPermissions.clientId, clientId))
      .leftJoin(
        avalonFcmTokens,
        eq(avalonFcmTokens.deviceId, avalonAuthPermissions.deviceId)
      )
      .then(async (devices) => {
        if (devices.length === 0) {
          cb(false, "no available devices for this client");
          return;
        }

        await createLog({
          clientId: client.id,
          kind: "request",
        });

        this.sessions[clientId] = {
          cb,
          clientId,
          devicesId: devices.map((d) => d.deviceId),
          start: Date.now(),
        };

        // send a message to all of the devices associated with the fcmTokens
        for (let { fcmToken, deviceId } of devices) {
          if (fcmToken === null) continue;

          const message: Message = {
            data: {
              clientName: client.name,
              clientId: clientId,
            },
            token: fcmToken,
          };

          getMessaging()
            .send(message)
            .catch((_) => {
              this.logger.log(`Error sending message to ${deviceId} (${fcmToken})`);
              // this.logger.log(error)
            });
        }

        // remove the session after validityTime + 5 seconds
        setTimeout(async () => {
          if (this.sessions[clientId]) {
            await createLog({
              clientId: client.id,
              kind: "timeout",
            });
            this.sessions[clientId].cb(false, "timeout");
          }
          delete this.sessions[clientId];
        }, (validityTime + 5) * 1000);
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  async authorizeSession(
    clientId: string,
    deviceId: string,
    authorize: boolean
  ): CanBeError<{ clientId: string }> {
    const session = this.sessions[clientId];
    if (!session || Date.now() - session.start > validityTime * 1000)
      return { error: true, message: "No request found" };

    if (!session.devicesId.includes(deviceId))
      return { error: true, message: "You are not allowed to answer this request" };

    await createLog({
      clientId,
      deviceId,
      kind: "answer",
      answer: authorize,
    });

    delete this.sessions[clientId];
    session.cb(authorize, "answer of a device");

    return { error: false, data: { clientId } };
  }
}

const createLog = (log: {
  clientId: string;
  deviceId?: string;
  kind: "timeout" | "answer" | "request";
  answer?: boolean;
}) => {
  return db.insert(avalonLogs).values(log);
};
