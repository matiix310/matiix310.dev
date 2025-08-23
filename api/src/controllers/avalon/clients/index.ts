import { getClientById, getClients } from "@db/avalonUtils";
import { db } from "@db/index";
import { avalonClients } from "@db/schema/avalonClients";
import auth from "@libs/auth/auth";
import authService from "@libs/auth/authService";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

export const avalonClient = t.Object({
  id: t.String(),
  name: t.String(),
  kind: t.Union([t.Literal("web_extension"), t.Literal("pam")]),
  createdAt: t.Date(),
});

export default new Elysia({
  name: "Avalon Clients",
  prefix: "/clients",
})
  .use(authService)
  .model({
    avalonClient,
    avalonClientPlusKey: t.Intersect([avalonClient, t.Object({ key: t.String() })]),
  })
  .post(
    "",
    async ({ status, body, user }) => {
      const ids = await db
        .insert(avalonClients)
        .values({ name: body.name, kind: body.kind })
        .$returningId();

      if (ids.length == 0)
        return status(400, "Can't insert the client into the database");

      const newClient = await getClientById(ids[0].id);

      if (!newClient)
        return status(400, "Can't fetch the new client after insertion into the databse");

      // generate a new Api key
      const apiKey = await auth.api.createApiKey({
        body: {
          name: "avalon-client-api-key",
          userId: user.id,
          prefix: "avalon-client-api-key",
          rateLimitEnabled: false,
          permissions: {
            avalon: ["request"],
          },
          metadata: {
            clientId: newClient.id,
          },
        },
      });

      return { ...newClient, key: apiKey.key };
    },
    {
      auth: true,
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 20 }),
        kind: t.Union([t.Literal("web_extension"), t.Literal("pam")]),
      }),
      response: {
        200: "avalonClientPlusKey",
        400: t.Union([
          t.Literal("Can't insert the client into the database"),
          t.Literal("Can't fetch the new client after insertion into the databse"),
        ]),
      },
    }
  )
  .get("", () => getClients(), {
    auth: true,
    response: {
      200: "avalonClient[]",
    },
  })
  .get(
    "/:id",
    async ({ status, params: { id } }) => {
      const client = await getClientById(id);
      if (!client) return status(404, "The client was not found");
      return client;
    },
    {
      auth: true,
      response: { 200: "avalonClient", 404: t.Literal("The client was not found") },
    }
  )
  .delete(
    "/:id",
    async ({ status, params: { id }, headers }) => {
      const client = await getClientById(id);
      if (!client) return status(404, "The client was not found");

      // delete in db
      await db.delete(avalonClients).where(eq(avalonClients.id, id));

      // detete the api keys
      const apiKeys = await auth.api.listApiKeys({ headers });
      const toDelete = apiKeys.filter((k) => k.metadata!["clientId"] === client.id);

      await Promise.allSettled(
        toDelete.map(({ id }) =>
          auth.api.deleteApiKey({
            body: { keyId: id },
          })
        )
      );

      return getClients();
    },
    {
      auth: true,
      response: { 200: "avalonClient[]", 404: t.Literal("The client was not found") },
    }
  )
  .post(
    "/:id",
    async ({ status, params: { id }, body }) => {
      // check that the keys can be modified
      const allowed = ["name", "kind"];
      for (let key in body)
        if (!allowed.includes(key))
          return status(
            400,
            "You can only edit the following properties: [" + allowed.join(", ") + "]"
          );

      const client = await db.query.avalonClients.findFirst({
        where: eq(avalonClients.id, id),
      });

      // client not found
      if (!client) return status(400, "There is no clients with the provided id");

      const promises = [];

      if (body.name || body.kind)
        promises.push(db.update(avalonClients).set(body).where(eq(avalonClients.id, id)));

      return await Promise.all(promises)
        .then(async (_) => {
          const newClient = await getClientById(id);
          if (!newClient)
            return status(500, "After modification, there is no client with the same ID");

          return newClient;
        })
        .catch((e) => {
          console.error(e);
          return status(500, "Error while fetching the new client");
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
  .get(
    "/:id/regenerate-key",
    async ({ status, params: { id }, headers, user }) => {
      const client = await getClientById(id);

      if (client === undefined) return status(404, "The client was not found");

      // find the old key
      const key = (await auth.api.listApiKeys({ headers })).find(
        (k) => k.metadata!["clientId"] === client.id
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
          name: "avalon-client-api-key",
          userId: user.id,
          prefix: "avalon-client-api-key",
          rateLimitEnabled: false,
          permissions: {
            avalon: ["request"],
          },
          metadata: {
            clientId: client.id,
          },
        },
      });

      return { key: newKey.key };
    },
    {
      auth: true,
      response: {
        200: t.Object({ key: t.String() }),
        404: t.Literal("The client was not found"),
      },
    }
  );
