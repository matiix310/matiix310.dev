import Elysia, { t } from "elysia";

import Path from "path";

import ReactPathExplorer from "@libs/reactPathExplorer";

type ReactPluginProps = {
  url: string;
  path: string;
  description?: string;
  summary?: string;
};

const reactPlugin = ({ url, path, description, summary }: ReactPluginProps) => {
  const reactPathExplorer = new ReactPathExplorer(path);
  const pathsMapping = reactPathExplorer.getPathsMapping();

  const app = new Elysia({
    name: "React plugin",
    seed: url,
    detail: { tags: ["Static"], description, summary },
  });

  for (let pathMapping of pathsMapping)
    app.get(Path.join(url, pathMapping.path), () => Bun.file(pathMapping.filePath));

  return app;
};

export default reactPlugin;
