import logPlugin from "@libs/logPlugin";
import UploadManager from "@libs/uploadManager";
import Elysia from "elysia";

export default new Elysia({ name: "upload", prefix: "/upload" })
  .use(logPlugin("Upload").prefix("decorator", "upload"))
  .decorate((decorators) => ({
    uploadManager: new UploadManager(decorators.uploadLogger),
    ...decorators,
  }))
  .post("/", ({ body, headers, uploadManager }) => {
    if (!headers["x-key"] || headers["x-key"] != "MySecretKey") {
      return new Response("Invalid key!", { status: 401 });
    }

    return uploadManager.upload(
      headers["x-id"],
      headers["x-filename"],
      headers["x-done"],
      (body as { data: Blob }) || undefined
    );
  });
