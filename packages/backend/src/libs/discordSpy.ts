import { DiscordAccesRepport, DiscordSpyData } from "discord-spy";
import { CanBeError } from "matiix";
import { Logger } from "@libs/logPlugin";
import { readdirSync } from "fs";

export default class DiscordSpy {
  private repports = new Map<string, { image: string; repport: DiscordAccesRepport[] }>();
  private logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  addSpy(name: string, image: string): CanBeError<DiscordSpyData> {
    if (this.repports.has(name)) {
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

    this.repports.set(name, { image, repport: [] });
    return {
      error: false,
      data: {
        name,
      },
    };
  }

  removeSpy(name: string): boolean {
    return this.repports.delete(name);
  }

  getSpies(): { error: boolean; data: string[] } {
    return { error: false, data: Array.from(this.repports.keys()) };
  }

  getReport(name: string): CanBeError<DiscordAccesRepport[]> {
    const data = this.repports.get(name);

    if (!data)
      return {
        error: true,
        message: `There is no repport with the name '${name}'.`,
      };

    return {
      error: false,
      data: data.repport,
    };
  }

  getImage(name: string): CanBeError<string> {
    const data = this.repports.get(name);

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

  repport(name: string, data: DiscordAccesRepport) {
    this.repports.get(name)?.repport.push(data);
  }
}
