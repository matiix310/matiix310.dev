import { Logger } from "@libs/logPlugin";
import { CanBeError } from "matiix";
import { db } from "@db/index.ts";
import { eq } from "drizzle-orm";
import { avalonDevices } from "@db/schema/avalonDevices.ts";
import { avalonAuthPermissions } from "@db/schema/avalonAuthPermissions.ts";
import { avalonFcmTokens } from "@db/schema/avalonFcmTokens.ts";
import { initializeApp } from "firebase-admin/app";
import { getMessaging, type Message } from "firebase-admin/messaging";

type Session = {
  cb: (authenticated: boolean) => void;
  sourceId: string;
  destinationIds: string[];
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

  async createAuthSession(sourceId: string, cb: Session["cb"]): Promise<void> {
    if (this.sessions[sourceId]) {
      cb(false);
      return;
    }

    // check if the device exists
    const device = await db.query.avalonDevices.findFirst({
      where: eq(avalonDevices.id, sourceId),
    });

    if (!device) {
      cb(false);
      return;
    }

    // Tell the phones to authorize the session
    db.select({
      fcmToken: avalonFcmTokens.fcmToken,
      deviceId: avalonFcmTokens.deviceId,
    })
      .from(avalonDevices)
      .innerJoin(
        avalonAuthPermissions,
        eq(avalonAuthPermissions.sourceId, avalonDevices.id)
      )
      .innerJoin(
        avalonFcmTokens,
        eq(avalonFcmTokens.deviceId, avalonAuthPermissions.destinationId)
      )
      .where(eq(avalonDevices.id, sourceId))
      .then((fcmTokens) => {
        if (fcmTokens.length == 0) {
          cb(false);
          return;
        }

        this.sessions[sourceId] = {
          cb,
          sourceId,
          destinationIds: [],
          start: Date.now(),
        };

        // add the devices that are allowed to answer this request
        for (let { deviceId } of fcmTokens)
          this.sessions[sourceId].destinationIds.push(deviceId);

        // send a message to all of the devices associated with the fcmTokens
        for (let { fcmToken, deviceId } of fcmTokens) {
          const message: Message = {
            data: {
              deviceName: device.name,
              deviceId: sourceId,
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
        setTimeout(() => {
          if (this.sessions[sourceId]) this.sessions[sourceId].cb(false);
          delete this.sessions[sourceId];
        }, (validityTime + 5) * 1000);
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  authorizeSession(
    sourceId: string,
    destinationId: string,
    authorize: boolean
  ): CanBeError<{ sourceId: string }> {
    const session = this.sessions[sourceId];
    if (!session || Date.now() - session.start > validityTime * 1000)
      return { error: true, message: "No request found" };

    if (!session.destinationIds.includes(destinationId))
      return { error: true, message: "You are not allowed to answer this request" };

    delete this.sessions[sourceId];
    session.cb(authorize);

    return { error: false, data: { sourceId } };
  }
}
