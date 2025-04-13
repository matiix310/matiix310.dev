import Elysia, {t} from "elysia";
import logPlugin from "@libs/logPlugin";
import Auth from "@libs/auth";
import {jwt} from "@elysiajs/jwt";
import {avalonFcmTokens} from '@db/schema/avalonFcmTokens'
import {db} from "@db/index.ts";
import {sql} from "drizzle-orm"
import sshValidate from "@libs/sshValidate.ts";

export default new Elysia({name: "auth", prefix: "/auth"})
  .use(logPlugin("Auth").prefix("decorator", "auth"))
  .decorate((decorators) => ({
    auth: new Auth(decorators.authLogger),
    ...decorators,
  }))
  //  .use(
  //    jwt({
  //      name: "jwt",
  //      secret: "Fischl von Luftschloss Narfidort",
  //    })
  //  )
  .get("/request", async ({query, set, auth, authLogger}) => {
    authLogger.log(`(${query.id}) requested an authentication`);

    if (!sshValidate(query.id, query.data, query.signature, true)) {
      authLogger.log(`(${query.id}) request aborted (invalid signature)`);
      set.status = 401
      return {
        error: true,
        message: "Invalid signature, authentication failed"
      }
    }

    return new Promise(async (resolve) => {
      await auth.createAuthSession(query.id, (authorized) => {
        set.status = authorized ? 200 : 401;
        if (authorized) authLogger.success("Authentication successful!");
        else authLogger.error("Authentication failed!");
        resolve(new Response());
      });
    });
  }, {
    query: t.Object({
      id: t.String(),
      data: t.String(),
      signature: t.String()
    })
  })
  .post("/answer", async ({body, auth, set, authLogger}) => {
    authLogger.log(`(${body.id}) is trying to answer`);

    console.log("Signature:", body.signature.toString())

    if (!sshValidate(body.id, body.data, body.signature)) {
      authLogger.log(`(${body.id}) request aborted (invalid signature)`);
      set.status = 401
      return {
        error: true,
        message: "Invalid signature, authentication failed"
      }
    }

    let answer: boolean | undefined
    let sourceId: string | undefined

    try {
      const data = JSON.parse(body.data);
      answer = data["answer"]
      sourceId = data["sourceId"]
    } catch(err) {
      authLogger.log("Error while parsing data from body:", err)
      return { error: true, message: "invalid data" }
    }

    if (answer == undefined || !sourceId)
      return {error: true, message: "Malformed query"}

    authLogger.log("Answered successfully")
    return auth.authorizeSession(sourceId, body.id, answer)
  }, {
    body: t.Object({
      id: t.String(),
      data: t.String(),
      signature: t.String()
    })
  })
  .post("/devices", async ({body, set, authLogger}) => {
    authLogger.log(`(${body.id}) requested a token update`);

    if (!sshValidate(body.id, body.data, body.signature)) {
      authLogger.log(`(${body.id}) request aborted (invalid signature)`);
      set.status = 401
      return {
        error: true,
        message: "Invalid signature, authentication failed"
      }
    }

    const fcmTokens = await db.select().from(avalonFcmTokens).where(sql`${avalonFcmTokens.deviceId} = ${body.id}`)
      .catch(err => {
        authLogger.error(err)
      })

    if (!fcmTokens)
      return

    let error = false
    if (fcmTokens.length == 0)
      await db
        .insert(avalonFcmTokens)
        .values({deviceId: body.id, fcmToken: body.data})
        .catch(err => {
          error = true
          authLogger.error(err)
        })
    else
      await db
        .update(avalonFcmTokens)
        .set({fcmToken: body.data})
        .where(sql`${avalonFcmTokens.deviceId} = ${body.id}`)
        .catch(err => {
          error = true
          authLogger.error(err)
        })

    if (error)
      set.status = 500

    return {error};

  }, {
    body: t.Object({
      id: t.String(),
      data: t.String(),
      signature: t.String()
    })
  });
