import Elysia from "elysia";

export default new Elysia({ name: "health", prefix: "/health" }).get(
  "/",
  ({ status }) => {
    return status(200, { message: "Health checked" });
  }
);
