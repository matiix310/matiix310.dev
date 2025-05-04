import { t } from "elysia";
import { CurlModule } from "../curlModules";

const type = t.Number();

export default {
  queryParam: "top",
  endPriority: 2,
  type,
  action: (data, offset) => {
    if (isNaN(offset) || offset <= 0 || offset > 500) return;

    const line = " ".repeat(data.offsetX + data.width) + "\n";
    data.frame = line.repeat(offset) + data.frame;

    data.offsetY += offset;
  },
  title: "Top offset",
  description: "Offset the video frame from the top border",
} as const satisfies CurlModule<typeof type>;
