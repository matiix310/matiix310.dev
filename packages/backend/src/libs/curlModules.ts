import { CurlModuleData } from "curl";
import { Logger } from "@plugins/logPlugin";
import backgroundColor from "./curlModules/backgroundColor";
import foregroundColor from "./curlModules/foregroundColor";
import leftOffset from "./curlModules/leftOffset";
import progressBar from "./curlModules/progressBar";
import topOffset from "./curlModules/topOffset";
import { t, TSchema, type Static } from "elysia";

const activeModules = [
  backgroundColor,
  foregroundColor,
  leftOffset,
  topOffset,
  progressBar,
];

export const CurlQueryParameters = t.Object({
  [backgroundColor.queryParam]: t.Optional(backgroundColor.type),
  [foregroundColor.queryParam]: t.Optional(foregroundColor.type),
  [leftOffset.queryParam]: t.Optional(leftOffset.type),
  [topOffset.queryParam]: t.Optional(topOffset.type),
  [progressBar.queryParam]: t.Optional(progressBar.type),
});

type CurlQueryParameters = keyof Static<typeof CurlQueryParameters>;

class CurlModules {
  private logger;

  applyModules(
    frame: string,
    frameIndex: number,
    frameCount: number,
    query: { [key in CurlQueryParameters]: string | undefined }
  ): string {
    const width = frame.indexOf("\n");
    const data: CurlModuleData = {
      frame,
      frameIndex,
      frameCount,
      width,
      height: frame.length / width,
      offsetX: 0,
      offsetY: 0,
    };

    for (let module of activeModules) {
      if (query[module.queryParam]) module.action(data, query[module.queryParam]);
    }

    return data.frame;
  }

  constructor(logger: Logger) {
    this.logger = logger;
    // const folderPath = path.join(__dirname, "curlModules");
    // const folder = readdirSync(folderPath);

    // const modules = folder.map((fileName) => {
    //   return new Promise<number>(async (resolve, _) => {
    //     const modulePath = folderPath + "/" + fileName;
    //     const curlModule = await import(modulePath);

    //     if (!(curlModule.default instanceof CurlModule)) {
    //       this.logger.warn("Curl module", fileName, "is not an instance of CurlModule!");
    //       return resolve(0);
    //     }

    //     this.activeModules.push(curlModule.default);
    //     return resolve(1);
    //   });
    // });

    // Promise.all(modules).then((e) => {
    //   const success = e.reduce((acc, cv) => acc + cv);
    //   const failed = e.length - success;

    //   if (failed > 0) this.logger.warn("Failed modules:", failed);
    //   this.logger.log("Loaded modules:", success);

    //   this.activeModules.sort((a, b) => a.endPriority - b.endPriority);
    // });

    this.logger.log("Loaded modules:", activeModules.length);
    activeModules.sort((a, b) => a.endPriority - b.endPriority);
  }
}

t.Literal("coucou");

export type CurlModule<T extends TSchema> = {
  queryParam: string;
  endPriority: number;
  type: T;
  action: (data: CurlModuleData, queryContent: Static<T>) => void;
  title: string;
  description: string;
};

export { CurlModules };
