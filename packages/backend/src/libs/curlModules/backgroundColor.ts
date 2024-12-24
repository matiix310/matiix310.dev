import { CurlModule } from "../curlModules";

export default new CurlModule(
  "bg",
  1,
  (data, color) => {
    if (!color) return;

    let colorCode = "";

    switch (color.toLowerCase()) {
      case "black":
        colorCode = "\x1b[40m";
        break;
      case "red":
        colorCode = "\x1b[41m";
        break;
      case "green":
        colorCode = "\x1b[42m";
        break;
      case "yellow":
        colorCode = "\x1b[43m";
        break;
      case "blue":
        colorCode = "\x1b[44m";
        break;
      case "magenta":
        colorCode = "\x1b[45m";
        break;
      case "cyan":
        colorCode = "\x1b[46m";
        break;
      case "white":
        colorCode = "\x1b[47m";
        break;
      case "bright_black":
        colorCode = "\x1b[100m";
        break;
      case "bright_red":
        colorCode = "\x1b[101m";
        break;
      case "bright_green":
        colorCode = "\x1b[102m";
        break;
      case "bright_yellow":
        colorCode = "\x1b[103m";
        break;
      case "bright_blue":
        colorCode = "\x1b[104m";
        break;
      case "bright_magenta":
        colorCode = "\x1b[105m";
        break;
      case "bright_cyan":
        colorCode = "\x1b[106m";
        break;
      case "bright_white":
        colorCode = "\x1b[107m";
        break;
    }

    let newFrame = "";

    for (let line of data.frame.split("\n")) {
      newFrame += colorCode + line + "\x1b[0m\n";
    }

    data.frame = newFrame;
  },
  "Background color",
  "Change the color of the frame background"
);
