import { CurlModule } from "../curlModules";

export default new CurlModule(
  "fg",
  1,
  (data, color) => {
    if (!color) return;

    let colorCode = "";

    switch (color.toLowerCase()) {
      case "black":
        colorCode = "\x1b[30m";
        break;
      case "red":
        colorCode = "\x1b[31m";
        break;
      case "green":
        colorCode = "\x1b[32m";
        break;
      case "yellow":
        colorCode = "\x1b[33m";
        break;
      case "blue":
        colorCode = "\x1b[34m";
        break;
      case "magenta":
        colorCode = "\x1b[35m";
        break;
      case "cyan":
        colorCode = "\x1b[36m";
        break;
      case "white":
        colorCode = "\x1b[37m";
        break;
      case "bright_black":
        colorCode = "\x1b[90m";
        break;
      case "bright_red":
        colorCode = "\x1b[91m";
        break;
      case "bright_green":
        colorCode = "\x1b[92m";
        break;
      case "bright_yellow":
        colorCode = "\x1b[93m";
        break;
      case "bright_blue":
        colorCode = "\x1b[94m";
        break;
      case "bright_magenta":
        colorCode = "\x1b[95m";
        break;
      case "bright_cyan":
        colorCode = "\x1b[96m";
        break;
      case "bright_white":
        colorCode = "\x1b[97m";
        break;
    }

    let newFrame = "";

    for (let line of data.frame.split("\n")) {
      newFrame += colorCode + line + "\x1b[0m\n";
    }

    data.frame = newFrame;
  },
  "Foreground color",
  "Change the color of the frame foreground"
);
