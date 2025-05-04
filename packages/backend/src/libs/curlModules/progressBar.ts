import { t } from "elysia";
import { CurlModule } from "../curlModules";

const type = t.Any();

export default {
  queryParam: "progress",
  endPriority: 2,
  type,
  action: (data, _) => {
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
  title: "Progress bar",
  description: "Add a progress bar at the bottom of the video",
} as const satisfies CurlModule<typeof type>;
