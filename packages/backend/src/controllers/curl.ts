import Elysia from "elysia";
import Stream from "@libs/stream";
import fs from "fs";
import { CurlModules } from "@libs/curlModules";
import logPlugin, { Logger } from "@libs/logPlugin";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

type ConfigType = {
  [key: string]: {
    fps: number;
  };
};

export default new Elysia({ name: "curl", prefix: "/curl" })
  .use(logPlugin("Curl").prefix("decorator", "curl"))
  .decorate((decorators) => ({
    curlModules: new CurlModules(decorators.curlLogger),
    ...decorators,
  }))
  .get(
    "/:resourceId",
    async ({ request, params: { resourceId }, query, curlModules }) => {
      // TODO: Use BDD
      const config: ConfigType = await Bun.file("./src/assets/curl/config.json").json();
      if (!config[resourceId]) {
        return new Response("Invalid resource id!\n");
      }

      const folder = fs.readdirSync("./src/assets/curl/" + resourceId);

      if (folder.length == 0) {
        return new Response("Invalid resource id: " + resourceId + "\n");
      }

      folder.sort();

      const stream = new Stream(undefined, { rowData: true });

      let frameIndex = 0;
      let frameCount = folder.length;

      const sendFrame = async () => {
        const frame = await Bun.file(
          "./src/assets/curl/" + resourceId + "/" + folder[frameIndex]
        ).text();

        const newFrame = curlModules.applyModules(frame, frameIndex, frameCount, query);

        stream.send("\x1b[2J\x1b[3J\x1b[H" + newFrame);
        // request.signal.aborted;
        frameIndex = (frameIndex + 1) % frameCount;
      };

      const interval = setInterval(() => {
        sendFrame();
      }, 1000 / config[resourceId].fps);

      sendFrame();

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        stream.close();
      });

      return stream;
    }
  );
