import { db } from "@db/index";
import { avalonVault } from "@db/schema/avalonVault";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

export const avalonVaultEntry = t.Object({
  id: t.String(),
  name: t.String(),
  uriRegex: t.String(),
  kind: t.Union([t.Literal("username"), t.Literal("email"), t.Literal("password")]),
  group: t.Number(),
  createdAt: t.Date(),
});

export default new Elysia({
  name: "Avalon Vault",
  prefix: "/vault",
})
  .model({
    avalonVaultEntry,
  })
  .get(
    "/entry",
    async ({}) => {
      const vault = await db.query.avalonVault.findMany({
        columns: {
          id: true,
          name: true,
          uriRegex: true,
          kind: true,
          group: true,
          createdAt: true,
        },
      });
      return vault;
    },
    {
      auth: true,
      response: { 200: "avalonVaultEntry[]" },
    }
  )
  .post(
    "/entry",
    async ({ status, body }) => {
      const allowed = ["name", "uriRegex", "kind", "content", "group"];
      for (let key in body)
        if (!allowed.includes(key))
          return status(
            400,
            "You can only edit the following properties: " + allowed.join(", ") + "."
          );

      const ids = await db.insert(avalonVault).values(body).$returningId();

      if (ids.length == 0) return status(400, "Can't insert the entry into the vault");

      const newVaultEntry = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, ids[0].id),
      });

      if (newVaultEntry === undefined)
        return status(400, "Error while fetching the new device");

      return newVaultEntry;
    },
    {
      auth: true,
      response: {
        200: "avalonVaultEntry",
        400: t.String(),
      },
      body: t.Object({
        name: t.String(),
        uriRegex: t.String(),
        kind: t.Union([t.Literal("username"), t.Literal("email"), t.Literal("password")]),
        content: t.String(),
        group: t.Number({ minimum: 0 }),
      }),
    }
  )
  .delete(
    "/entry/:id",
    async ({ status, params: { id } }) => {
      const vaultEntry = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, id),
      });

      if (!vaultEntry) return status(404, "The vault entry was not found");

      // delete in db
      await db.delete(avalonVault).where(eq(avalonVault.id, id));

      return { ...vaultEntry, content: undefined };
    },
    {
      auth: true,
      response: {
        200: "avalonVaultEntry",
        404: t.Literal("The vault entry was not found"),
      },
    }
  )
  .post(
    "/entry/:id",
    async ({ status, params: { id }, body }) => {
      const allowed = ["name", "uriRegex", "kind", "content", "group"];
      for (let key in body)
        if (!allowed.includes(key))
          return status(
            400,
            "You can only edit the following properties: " + allowed.join(", ") + "."
          );

      if (Object.keys(body).length === 0)
        return status(400, "The body must not be empty");

      const vaultEntry = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, id),
      });

      // vaultEntry not found
      if (!vaultEntry) return status(400, "There is no vault entry with the provided id");

      await db.update(avalonVault).set(body).where(eq(avalonVault.id, id));

      const newVaultEntry = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, id),
      });
      if (!newVaultEntry) {
        console.error("Can't return the new vault entry (was removed?)");
        return status(500, "After modification, there is no device with the same ID");
      }

      return { ...newVaultEntry, content: body.content };
    },
    {
      auth: true,
      response: {
        200: "avalonVaultEntry",
        400: t.String(),
        500: t.Literal("After modification, there is no device with the same ID"),
      },
      body: t.Object({
        name: t.Optional(t.String()),
        uriRegex: t.Optional(t.String()),
        kind: t.Optional(
          t.Union([t.Literal("username"), t.Literal("email"), t.Literal("password")])
        ),
        content: t.Optional(t.String()),
        group: t.Optional(t.Number({ minimum: 0 })),
      }),
    }
  )
  .get(
    "/content/:id",
    async ({ status, params: { id } }) => {
      const content = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, id),
        columns: { content: true },
      });

      if (content === undefined) return status(400, "Unknown id");

      return content;
    },
    {
      securedAuth: true,
      response: {
        400: t.Literal("Unknown id"),
        200: t.Object({
          content: t.String(),
        }),
      },
    }
  );
