import { t } from "elysia";
import { CurlModule } from "../curlModules";

const type = t.Number();

export default {
  queryParam: "left",
  endPriority: 2,
  type,
  action: (data, offset) => {
    if (isNaN(offset) || offset <= 0 || offset > 500) return;

    let newFrame = "";

    for (let line of data.frame.split("\n")) {
      newFrame += " ".repeat(offset) + line + "\n";
    }

    data.offsetX += offset;

    data.frame = newFrame;
  },
  title: "Left offset",
  description: "Offset the video frame from the left border",
} as const satisfies CurlModule<typeof type>;
