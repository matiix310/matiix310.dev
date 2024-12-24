import Elysia from "elysia";
import util from "node:util";
import { appendFile, mkdirSync, existsSync } from "fs";

export class Logger {
  private name;

  constructor(name: string) {
    this.name = name;
  }

  private writeToFile(line: string) {
    const date = new Date();

    const formatedDate = `${date.getFullYear()}-${
      (date.getMonth() < 10 ? "0" : "") + date.getMonth()
    }-${(date.getDate() < 10 ? "0" : "") + date.getDate()}`;

    const path = process.env.BASE_FOLDER! + process.env.LOGS_FOLDER! + formatedDate + "/";

    if (!existsSync(path)) mkdirSync(path);

    appendFile(path + this.name + ".log", line + "\n", (err) => {
      if (err) console.error(err);
    });
  }

  private timestamp() {
    const date = new Date();
    return `[${date.toTimeString().split(" (")[0]}]`;
  }

  log(...data: any[]) {
    const line = util.format(`  ${this.timestamp()} <${this.name}>`, ...data);
    console.log(line);
    this.writeToFile(line);
  }

  error(...data: any[]) {
    const line = util.format(`❌${this.timestamp()} <${this.name}>`, ...data);
    console.error(line);
    this.writeToFile(line);
  }

  warn(...data: any[]) {
    const line = util.format(
      `\x1b[33m⚠️${this.timestamp()} <${this.name}>`,
      ...data,
      "\x1b[0m"
    );
    console.warn(line);
    this.writeToFile(line);
  }

  success(...data: any[]) {
    const line = util.format(
      `\x1b[32m✅${this.timestamp()} <${this.name}>`,
      ...data,
      "\x1b[0m"
    );
    console.log(line);
    this.writeToFile(line);
  }
}

const plugin = (name: string) => new Elysia().decorate("Logger", new Logger(name));

export default plugin;
