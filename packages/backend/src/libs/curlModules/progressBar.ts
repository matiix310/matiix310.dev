import { CurlModule } from "../curlModules";

export default new CurlModule(
  "progress",
  2,
  (data, _) => {
    const percent = " " + Math.floor((data.frameIndex * 100) / data.frameCount) + "% ";
    const progressWidth =
      (data.frameIndex / data.frameCount) * (data.width - percent.length);
    const progressStr =
      "\n" +
      " ".repeat(data.offsetX) +
      percent +
      "─".repeat(progressWidth) +
      "▋" +
      "╶".repeat(data.width - progressWidth - percent.length) +
      "\n";
    data.frame += progressStr;
  },
  "Progress bar",
  "Add a progress bar at the bottom of the video"
);
