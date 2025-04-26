import DiscordSpy, { DiscordAccessReport, IsError, IsSuccess } from "@libs/discordSpy";
import logPlugin from "@plugins/logPlugin";
import Elysia, { error, t } from "elysia";
import path from "path";

export default new Elysia({
  name: "discordSpy",
  prefix: "/ds",
  detail: {
    tags: ["Discord Spy"],
  },
})
  .use(logPlugin("DiscordSpy").prefix("decorator", "discordspy"))
  .decorate((decorators) => ({
    discordSpy: new DiscordSpy(decorators.discordspyLogger),
    ...decorators,
  }))
  .get(
    "/:name",
    ({ request, discordSpy, params: { name }, discordspyLogger }) => {
      const image = discordSpy.getImage(name);

      if (image.error) return error(400, image.message);

      discordSpy.report(name, {
        date: Date.now(),
        userAgent: request.headers.get("user-agent") ?? "No user agent",
      });

      return Bun.file(
        path.join(process.env.BASE_FOLDER! + process.env.DOWNLOADS_FOLDER!, image.data)
      );
    },
    {
      response: { 200: t.File(), 400: t.String() },
    }
  )
  .get(
    "/reports/:name",
    ({ discordSpy, params: { name } }) => {
      const report = discordSpy.getReport(name);

      if (report.error) return error(400, report);

      return report;
    },
    {
      response: {
        200: IsSuccess(t.Array(DiscordAccessReport)),
        400: IsError(),
      },
    }
  )
  .get(
    "/reports",
    ({ discordSpy }) => {
      const spies = discordSpy.getSpies();
      if (spies.error) return error(400, spies);
      return spies;
    },
    {
      response: {
        200: IsSuccess(t.Array(t.String())),
        400: IsError(),
      },
    }
  )
  .post(
    "/reports",
    ({ body, discordSpy }) => {
      const realBody = body as { name?: string; image?: string };
      if (!realBody || !realBody.name || !realBody.image) {
        return {
          error: true,
          message: "Malformed body. It should contain a name and an image.",
        };
      }

      const spy = discordSpy.addSpy(realBody.name, realBody.image);
      if (spy.error) return error(400, spy);
      return spy;
    },
    {
      response: {
        200: IsSuccess(t.Object({ name: t.String() })),
        400: IsError(),
      },
    }
  )
  .delete(
    "/reports",
    ({ body, discordSpy }) => {
      const realBody = body as { name?: string; image?: string };
      if (!realBody || !realBody.name) {
        return error(400, {
          error: true,
          message: "Malformed body. It should contain a name.",
        });
      }

      const success = discordSpy.removeSpy(realBody.name);

      if (!success) {
        return error(400, {
          error: true,
          message: `Error while deleting ${realBody.name}.`,
        });
      }

      return {
        error: false,
        data: true,
      };
    },
    {
      response: {
        200: IsSuccess(t.Literal(true)),
        400: IsError(),
      },
    }
  );
