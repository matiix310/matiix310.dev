import Elysia, { t } from "elysia";
import logPlugin from "@libs/logPlugin";
import Avalon from "@libs/avalon";
import { avalonFcmTokens } from "@db/schema/avalonFcmTokens";
import { db } from "@db/index.ts";
import { sql } from "drizzle-orm";
import sshValidate from "@libs/sshValidate.ts";

export default new Elysia({ name: "avalon", prefix: "/avalon" })
  .use(logPlugin("Avalon").prefix("decorator", "avalon"))
  .decorate((decorators) => ({
    avalon: new Avalon(decorators.avalonLogger),
    ...decorators,
  }))
  .get(
    "/request",
    async ({ query, set, avalon, avalonLogger }) => {
      avalonLogger.log(`(${query.id}) requested an authentication`);

      if (!sshValidate(query.id, query.data, query.signature, true)) {
        avalonLogger.log(`(${query.id}) request aborted (invalid signature)`);
        set.status = 401;
        return {
          error: true,
          message: "Invalid signature, authentication failed",
        };
      }

      return new Promise(async (resolve) => {
        await avalon.createAuthSession(query.id, (authorized) => {
          set.status = authorized ? 200 : 401;
          if (authorized) avalonLogger.success("Authentication successful!");
          else avalonLogger.error("Authentication failed!");
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
    async ({ body, auth, set, avalonLogger }) => {
      avalonLogger.log(`(${body.id}) is trying to answer`);

      console.log("Signature:", body.signature.toString());

      if (!sshValidate(body.id, body.data, body.signature)) {
        avalonLogger.log(`(${body.id}) request aborted (invalid signature)`);
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
        avalonLogger.log("Error while parsing data from body:", err);
        return { error: true, message: "invalid data" };
      }

      if (answer == undefined || !sourceId)
        return { error: true, message: "Malformed query" };

      avalonLogger.log("Answered successfully");
      return auth.authorizeSession(sourceId, body.id, answer);
    },
    {
      body: t.Object({
        id: t.String(),
        data: t.String(),
        signature: t.String(),
      }),
    }
  )
  .post(
    "/devices",
    async ({ body, set, avalonLogger }) => {
      avalonLogger.log(`(${body.id}) requested a token update`);

      if (!sshValidate(body.id, body.data, body.signature)) {
        avalonLogger.log(`(${body.id}) request aborted (invalid signature)`);
        set.status = 401;
        return {
          error: true,
          message: "Invalid signature, authentication failed",
        };
      }

      const fcmTokens = await db
        .select()
        .from(avalonFcmTokens)
        .where(sql`${avalonFcmTokens.deviceId} = ${body.id}`)
        .catch((err) => {
          avalonLogger.error(err);
        });

      if (!fcmTokens) return;

      let error = false;
      if (fcmTokens.length == 0)
        await db
          .insert(avalonFcmTokens)
          .values({ deviceId: body.id, fcmToken: body.data })
          .catch((err) => {
            error = true;
            avalonLogger.error(err);
          });
      else
        await db
          .update(avalonFcmTokens)
          .set({ fcmToken: body.data })
          .where(sql`${avalonFcmTokens.deviceId} = ${body.id}`)
          .catch((err) => {
            error = true;
            avalonLogger.error(err);
          });

      if (error) set.status = 500;

      return { error };
    },
    {
      body: t.Object({
        id: t.String(),
        data: t.String(),
        signature: t.String(),
      }),
    }
  );
