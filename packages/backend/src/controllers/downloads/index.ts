import logPlugin from "@plugins/logPlugin";
import { escapeHTML } from "bun";
import Elysia from "elysia";
import { readdirSync } from "fs";

export default new Elysia({ name: "downloads", prefix: "/downloads" })
  .use(logPlugin("Downloads").prefix("decorator", "downloads"))
  .get("/:id", ({ params: { id }, downloadsLogger }) => {
    const fileName = escapeHTML(id);
    const folder = process.env.BASE_FOLDER! + process.env.DOWNLOADS_FOLDER!;

    const downloads = readdirSync(folder);

    if (!downloads.includes(fileName)) return new Response("FILE NOT FOUND");

    return Bun.file(folder + fileName);
  });
