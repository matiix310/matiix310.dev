import { CurlModule } from "../curlModules";

export default new CurlModule(
  "left",
  2,
  (data, leftOffsetRaw) => {
    if (!leftOffsetRaw) return;

    const offset = parseInt(leftOffsetRaw);

    if (isNaN(offset) || offset <= 0 || offset > 500) return;

    let newFrame = "";

    for (let line of data.frame.split("\n")) {
      newFrame += " ".repeat(offset) + line + "\n";
    }

    data.offsetX += offset;

    data.frame = newFrame;
  },
  "Left offset",
  "Offset the video frame from the left border"
);
