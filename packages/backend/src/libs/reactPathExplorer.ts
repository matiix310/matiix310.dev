import fs from "fs";
import Path, { basename } from "path";

export default class ReactPathExplorer {
  private rootPath: string;
  private allowedPaths: string[] = [];

  constructor(rootPath: string) {
    if (!rootPath.endsWith("/")) this.rootPath = rootPath + "/";
    else this.rootPath = rootPath;

    this.rootPath = Path.normalize(this.rootPath);

    if (!fs.existsSync(this.rootPath))
      throw new Error(
        "The requested path does not exist in the file system or is unreachable!",
        { cause: "rootPath: " + rootPath }
      );

    // compute the allowed path
    this.computeAllowedPath(this.rootPath);
  }

  private computeAllowedPath(path: string) {
    for (let item of fs.readdirSync(path)) {
      const itemPath = Path.join(path, item);
      const stat = fs.lstatSync(itemPath);
      if (stat.isFile()) this.allowedPaths.push(itemPath.substring(this.rootPath.length));
      else this.computeAllowedPath(itemPath);
    }
  }

  getPathsMapping() {
    const pathsMapping: { path: string; filePath: string }[] = [];

    this.allowedPaths.forEach((p) => {
      const itemPath = Path.join(this.rootPath, p);
      pathsMapping.push({
        path: p,
        filePath: itemPath,
      });

      if (Path.basename(itemPath) === "index.html")
        pathsMapping.push({
          path: "/" + p.substring(0, p.length - "index.html".length),
          filePath: itemPath,
        });
    });

    return pathsMapping;
  }
}
