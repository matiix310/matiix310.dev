import { t } from "elysia";
import { CurlModule } from "../curlModules";

const colorCodes = {
  black: "\x1b[40m",
  red: "\x1b[41m",
  green: "\x1b[42m",
  yellow: "\x1b[43m",
  blue: "\x1b[44m",
  magenta: "\x1b[45m",
  cyan: "\x1b[46m",
  white: "\x1b[47m",
  bright_black: "\x1b[100m",
  bright_red: "\x1b[101m",
  bright_green: "\x1b[102m",
  bright_yellow: "\x1b[103m",
  bright_blue: "\x1b[104m",
  bright_magenta: "\x1b[105m",
  bright_cyan: "\x1b[106m",
  bright_white: "\x1b[107m",
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
  queryParam: "bg",
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
  title: "Background color",
  description: "Change the color of the frame background",
} as const satisfies CurlModule<typeof type>;
