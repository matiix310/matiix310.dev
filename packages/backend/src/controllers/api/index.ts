import Elysia from "elysia";

import authApiRoute from "./auth";
import avalonApiRoute from "./avalon";

export default new Elysia({
  name: "Api route",
  prefix: "/api",
  detail: { tags: ["Api"] },
})
  .use(authApiRoute)
  .use(avalonApiRoute);
