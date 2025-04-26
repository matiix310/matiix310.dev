import { t } from "elysia";
import { CurlModule } from "../curlModules";

const colorCodes = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bright_black: "\x1b[90m",
  bright_red: "\x1b[91m",
  bright_green: "\x1b[92m",
  bright_yellow: "\x1b[93m",
  bright_blue: "\x1b[94m",
  bright_magenta: "\x1b[95m",
  bright_cyan: "\x1b[96m",
  bright_white: "\x1b[97m",
};

const type = t.Union([
  t.Literal("black"),
  t.Literal("red"),
  t.Literal("green"),
  t.Literal("yellow"),
  t.Literal("blue"),
  t.Literal("magenta"),
  t.Literal("cyan"),
  t.Literal("white"),
  t.Literal("bright_black"),
  t.Literal("bright_red"),
  t.Literal("bright_green"),
  t.Literal("bright_yellow"),
  t.Literal("bright_blue"),
  t.Literal("bright_magenta"),
  t.Literal("bright_cyan"),
  t.Literal("bright_white"),
]);

export default {
  queryParam: "fg",
  endPriority: 1,
  type,
  action: (data, color) => {
    if (!color) return;

    let colorCode = colorCodes[color];

    let newFrame = "";

    for (let line of data.frame.split("\n")) {
      newFrame += colorCode + line + "\x1b[0m\n";
    }

    data.frame = newFrame;
  },
  title: "Foreground color",
  description: "Change the color of the frame foreground",
} as const satisfies CurlModule<typeof type>;
