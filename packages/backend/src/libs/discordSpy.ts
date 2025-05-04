import { Logger } from "@plugins/logPlugin";
import { readdirSync } from "fs";
import { Static, t, TSchema } from "elysia";

export const DiscordAccessReport = t.Object({
  date: t.Number(),
  userAgent: t.String(),
});
export type DiscordAccessReport = Static<typeof DiscordAccessReport>;

export const DiscordSpyData = t.Object({
  name: t.String(),
});
export type DiscordSpyData = Static<typeof DiscordSpyData>;

// export const CanBeError = <T extends TSchema>(T: T) =>
//   t.Union([
//     t.Object({ error: t.Literal(true), message: t.String() }),
//     t.Object({ error: t.Literal(false), data: T }),
//   ]);
export const IsError = () => t.Object({ error: t.Literal(true), message: t.String() });
export const IsSuccess = <T extends TSchema>(T: T) =>
  t.Object({ error: t.Literal(false), data: T });
export type CanBeError<T> = { error: true; message: string } | { error: false; data: T };

export default class DiscordSpy {
  private reports = new Map<string, { image: string; report: DiscordAccessReport[] }>();
  private logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  addSpy(name: string, image: string): CanBeError<DiscordSpyData> {
    if (this.reports.has(name)) {
      return {
        error: true,
        message: `The name '${name}' is already taken.`,
      };
    }

    if (!process.env.DOWNLOADS_FOLDER) {
      this.logger.error("Environement variable DOWNLOADS_FOLDER is not defined!");
      return {
        error: true,
        message: `This is an error from the server. In order to fix the issue please contact an admin.`,
      };
    }

    const downlaods = readdirSync(process.env.DOWNLOADS_FOLDER);

    if (!downlaods.includes(image)) {
      return {
        error: true,
        message: `The file '${image}' is not on the server.`,
      };
    }

    this.reports.set(name, { image, report: [] });
    return {
      error: false,
      data: {
        name,
      },
    };
  }

  removeSpy(name: string): boolean {
    return this.reports.delete(name);
  }

  getSpies(): CanBeError<string[]> {
    return { error: false, data: Array.from(this.reports.keys()) };
  }

  getReport(name: string): CanBeError<DiscordAccessReport[]> {
    const data = this.reports.get(name);

    if (!data)
      return {
        error: true,
        message: `There is no report with the name '${name}'.`,
      };

    return {
      error: false,
      data: data.report,
    };
  }

  getImage(name: string): CanBeError<string> {
    const data = this.reports.get(name);

    if (!data)
      return {
        error: true,
        message: `There is no image with the name '${name}'.`,
      };

    return {
      error: false,
      data: data.image,
    };
  }

  report(name: string, data: DiscordAccessReport) {
    this.reports.get(name)?.report.push(data);
  }
}
