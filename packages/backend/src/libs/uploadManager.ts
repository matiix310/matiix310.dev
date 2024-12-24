import { FileSink, nanoseconds } from "bun";
import { unlinkSync, readdirSync } from "fs";
import { Logger } from "@libs/logPlugin";

export default class UploadManager {
  private table = new Map<
    string,
    { fileSink: FileSink; timeoutCb: Timer; filePath: string }
  >();
  private logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async upload(
    id: string | undefined,
    filename: string | undefined,
    done: string | undefined,
    body: { data?: Blob } | undefined
  ): Promise<Response> {
    if (!id) {
      if (!filename) {
        return new Response("No file name provided", {
          status: 400,
          statusText: "No Filename",
        });
      }

      if (filename.length > 20) {
        return new Response("The provided filename is too long (> 20 characters)", {
          status: 400,
          statusText: "Invalid Filename",
        });
      }

      // TODO finish regex
      if (!new RegExp("").test(filename)) {
        return new Response("The provided filename is not valid", {
          status: 400,
          statusText: "Invalid Filename",
        });
      }

      if (!process.env.DOWNLOADS_FOLDER) {
        this.logger.error("The environment variable DOWNLOADS_FOLDER is not defined!");
        return new Response("Internal Server Error", {
          status: 500,
        });
      }

      if (readdirSync(process.env.DOWNLOADS_FOLDER).includes(filename)) {
        return new Response(
          "This filename (" + filename + ") already exists on the server",
          {
            status: 400,
            statusText: "Duplicate Filename",
          }
        );
      }

      // new client
      const id = nanoseconds().toString();
      const filePath = process.env.DOWNLOADS_FOLDER + filename;

    console.log(filePath);
      this.table.set(id, {
        fileSink: Bun.file(filePath + ".temp").writer(),
        timeoutCb: this.setTimeout(id),
        filePath,
      });

      return new Response(id);
    } else {
      const res = this.table.get(id);
      if (!res) {
        return new Response("Invalid or expired id", {
          status: 400,
          statusText: "Invalid Id",
        });
      }

      if (done) {
        // save the file
        clearTimeout(res.timeoutCb);
        res.fileSink.end();
        await Bun.write(Bun.file(res.filePath), Bun.file(res.filePath + ".temp"));
        unlinkSync(res.filePath + ".temp");
        this.table.delete(id);
      } else {
        if (!body || !body.data) {
          return new Response("Body is empty", {
            status: 400,
            statusText: "Empty Body",
          });
        }

        clearTimeout(res.timeoutCb);
        res.timeoutCb = this.setTimeout(id);

        res.fileSink.write(await body.data.arrayBuffer());
      }
    }

    return new Response("OK");
  }

  private setTimeout(id: string): Timer {
    return setTimeout(() => {
      const res = this.table.get(id);
      if (res) {
        res.fileSink.end(new Error("Timeout!"));
        unlinkSync(res.filePath + ".temp");
        this.table.delete(id);
      }
    }, 3000);
  }
}
