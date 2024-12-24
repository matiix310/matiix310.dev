import { CurlModule } from "../curlModules";

export default new CurlModule(
  "top",
  2,
  (data, topOffsetRaw) => {
    if (!topOffsetRaw) return;

    const offset = parseInt(topOffsetRaw);

    if (isNaN(offset) || offset <= 0 || offset > 500) return;

    const line = " ".repeat(data.offsetX + data.width) + "\n";
    data.frame = line.repeat(offset) + data.frame;

    data.offsetY += offset;
  },
  "Top offset",
  "Offset the video frame from the top border"
);
