import DiscordSpy from "@libs/discordSpy";
import logPlugin from "@libs/logPlugin";
import Elysia from "elysia";
import path from "path";

export default new Elysia({ name: "discordSpy", prefix: "/ds" })
  .use(logPlugin("DiscordSpy").prefix("decorator", "discordspy"))
  .decorate((decorators) => ({
    discordSpy: new DiscordSpy(decorators.discordspyLogger),
    ...decorators,
  }))
  .get("/:name", ({ request, discordSpy, params: { name }, discordspyLogger }) => {
    const image = discordSpy.getImage(name);

    if (image.error) return "matiix310.dev 1, utilisateur 0";

    discordSpy.repport(name, {
      date: Date.now(),
      userAgent: request.headers.get("user-agent") ?? "No user agent",
    });

    return Bun.file(
      path.join(process.env.BASE_FOLDER! + process.env.DOWNLOADS_FOLDER!, image.data)
    );
  })
  .get("/repports/:name", ({ discordSpy, params: { name } }) => {
    const repport = discordSpy.getReport(name);

    return repport;
  })
  .get("/repports", ({ discordSpy }) => {
    return discordSpy.getSpies();
  })
  .post("/repports", ({ body, discordSpy }) => {
    const realBody = body as { name?: string; image?: string };
    if (!realBody || !realBody.name || !realBody.image) {
      return {
        error: true,
        message: "Malformed body. It should contain a name and an image.",
      };
    }

    return discordSpy.addSpy(realBody.name, realBody.image);
  })
  .delete("/repports", ({ body, discordSpy }) => {
    const realBody = body as { name?: string; image?: string };
    if (!realBody || !realBody.name) {
      return {
        error: true,
        message: "Malformed body. It should contain a name.",
      };
    }

    const success = discordSpy.removeSpy(realBody.name);

    if (!success) {
      return {
        error: true,
        message: `Error while deleting ${realBody.name}.`,
      };
    }

    return {
      error: false,
      data: true,
    };
  });
