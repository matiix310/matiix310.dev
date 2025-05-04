import Elysia, { t } from "elysia";
import fs from "fs";
import { CurlModules, CurlQueryParameters } from "@libs/curlModules";
import logPlugin from "@plugins/logPlugin";

type ConfigType = {
  [key: string]: {
    fps: number;
  };
};

export default new Elysia({
  name: "curl",
  prefix: "/curl",
  detail: {
    tags: ["Curl"],
  },
})
  .use(logPlugin("Curl").prefix("decorator", "curl"))
  .decorate((decorators) => ({
    curlModules: new CurlModules(decorators.curlLogger),
    ...decorators,
  }))
  .get(
    "/:resourceId",
    async function* ({ params: { resourceId }, query, curlModules }) {
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

      let frameIndex = 0;
      let frameCount = folder.length;

      const interval = 1000 / config[resourceId].fps;

      while (1) {
        const frame = await Bun.file(
          "./src/assets/curl/" + resourceId + "/" + folder[frameIndex]
        ).text();

        const newFrame = curlModules.applyModules(frame, frameIndex, frameCount, query);

        frameIndex = (frameIndex + 1) % frameCount;
        yield "\x1b[2J\x1b[3J\x1b[H" + newFrame;

        await new Promise((resolve) => {
          setTimeout(resolve, interval);
        });
      }
    },
    {
      query: CurlQueryParameters,
    }
  );
