import logPlugin from "@plugins/logPlugin";
import { escapeHTML } from "bun";
import Elysia from "elysia";
import { readdirSync } from "fs";

export default new Elysia({ name: "musix", prefix: "/musix" })
  .use(logPlugin("Musix").prefix("decorator", "musix"))
  .get("/download/:id", ({ params: { id }, musixLogger }) => {
    const musicId = escapeHTML(id);
    const folder = process.env.BASE_FOLDER! + process.env.MUSICS_FOLDER!;
    const musics = readdirSync(folder);

    if (!musics.includes(musicId)) return new Response("MUSIC NOT FOUND");

    return Bun.file(folder + musicId);
  })
  .get("/api/", () => {
    return new Response("SOON");
  });
