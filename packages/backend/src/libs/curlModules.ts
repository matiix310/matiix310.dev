import path from "path";
import { readdirSync } from "fs";
import { CurlModuleData } from "curl";
import { Logger } from "@libs/logPlugin";

class CurlModules {
  private activeModules: CurlModule[] = new Array();
  private logger;

  applyModules(
    frame: string,
    frameIndex: number,
    frameCount: number,
    query: { [queryParam: string]: string | undefined }
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

    for (let module of this.activeModules) {
      if (query[module.queryParam]) module.action(data, query[module.queryParam]);
    }

    return data.frame;
  }

  constructor(logger: Logger) {
    this.logger = logger;
    const folderPath = path.join(__dirname, "curlModules");
    const folder = readdirSync(folderPath);

    const modules = folder.map((fileName) => {
      return new Promise<number>(async (resolve, _) => {
        const modulePath = folderPath + "/" + fileName;
        const curlModule = await import(modulePath);

        if (!(curlModule.default instanceof CurlModule)) {
          this.logger.warn("Curl module", fileName, "is not an instance of CurlModule!");
          return resolve(0);
        }

        this.activeModules.push(curlModule.default);
        return resolve(1);
      });
    });

    Promise.all(modules).then((e) => {
      const success = e.reduce((acc, cv) => acc + cv);
      const failed = e.length - success;

      if (failed > 0) this.logger.warn("Failed modules:", failed);
      this.logger.log("Loaded modules:", success);

      this.activeModules.sort((a, b) => a.endPriority - b.endPriority);
    });
  }
}

class CurlModule {
  queryParam;
  endPriority;
  action;
  title;
  description;

  constructor(
    queryParam: string,
    endPriority: number,
    action: (data: CurlModuleData, queryContent: string | undefined) => void,
    title: string,
    description: string
  ) {
    this.queryParam = queryParam;
    this.endPriority = endPriority;
    this.action = action;
    this.title = title;
    this.description = description;
  }
}

export { CurlModules, CurlModule };
