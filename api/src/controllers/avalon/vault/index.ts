import { db } from "@db/index";
import { avalonVault } from "@db/schema/avalonVault";
import authService from "@libs/auth/authService";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import Elysia, { t } from "elysia";

export const avalonInsertVaultEntrySchema = createInsertSchema(avalonVault);
export const avalonSelectVaultEntrySchema = createSelectSchema(avalonVault);

export default new Elysia({
  name: "Avalon Vault",
  prefix: "/vault",
})
  .use(authService)
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
          secured: true,
          createdAt: true,
        },
      });
      return vault;
    },
    {
      auth: true,
      response: { 200: t.Array(t.Omit(avalonSelectVaultEntrySchema, ["content"])) },
    }
  )
  .post(
    "/entry",
    async ({ status, body }) => {
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
        200: avalonSelectVaultEntrySchema,
        400: t.Union([
          t.Literal("Can't insert the entry into the vault"),
          t.Literal("Error while fetching the new device"),
        ]),
      },
      body: t.Omit(avalonInsertVaultEntrySchema, ["id", "createdAt"]),
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
        200: t.Omit(avalonSelectVaultEntrySchema, ["content"]),
        404: t.Literal("The vault entry was not found"),
      },
    }
  )
  .post(
    "/entry/:id",
    async ({ status, params: { id }, body }) => {
      const vaultEntry = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, id),
      });

      // vaultEntry not found
      if (!vaultEntry) return status(400, "There is no vault entry with the provided ID");

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
        200: t.Partial(t.Omit(avalonSelectVaultEntrySchema, ["content"])),
        400: t.Literal("There is no vault entry with the provided ID"),
        500: t.Literal("After modification, there is no device with the same ID"),
      },
      body: t.Omit(avalonInsertVaultEntrySchema, ["id", "createdAt"]),
    }
  )
  .get(
    "/content/:id",
    async ({ status, params: { id } }) => {
      const content = await db.query.avalonVault.findFirst({
        where: eq(avalonVault.id, id),
        columns: { content: true },
      });

      if (content === undefined) return status(404, "Vault entry not found");

      return content;
    },
    {
      securedAuth: true,
      response: {
        404: t.Literal("Vault entry not found"),
        200: t.Object({
          content: t.String(),
        }),
      },
    }
  );
