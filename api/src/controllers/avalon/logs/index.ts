import Elysia, { t } from "elysia";

import { db } from "@db/index";

import authService from "@libs/auth/authService";

export const avalonLog = t.Object({
  device: t.Optional(
    t.Object({
      id: t.String(),
      name: t.String(),
      kind: t.Union([t.Literal("computer"), t.Literal("laptop"), t.Literal("phone")]),
    })
  ),
  client: t.Object({
    id: t.String(),
    name: t.String(),
    kind: t.Union([t.Literal("pam"), t.Literal("web_extension")]),
  }),
  answer: t.Optional(t.Boolean()),
  kind: t.Union([t.Literal("request"), t.Literal("answer"), t.Literal("timeout")]),
  createdAt: t.Date(),
});

export default new Elysia({
  name: "Avalon Logs",
  prefix: "/logs",
})
  .use(authService)
  .model({
    avalonLog,
  })
  .get(
    "",
    async () => {
      const logs = await db.query.avalonLogs.findMany({
        with: {
          client: true,
          device: true,
        },
      });

      return logs.map((l) => ({
        id: l.id,
        device: l.device
          ? { id: l.device.id, name: l.device.name, kind: l.device.kind }
          : undefined,
        client: { id: l.client.id, name: l.client.name, kind: l.client.kind },
        answer: l.answer ?? undefined,
        kind: l.kind,
        createdAt: l.createdAt,
      }));
    },
    {
      auth: true,
      response: {
        200: "avalonLog[]",
      },
    }
  );
