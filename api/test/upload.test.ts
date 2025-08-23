import { expect, test } from "bun:test";
import { app } from "../src";

test("POST   /upload", async () => {
  const response = await app.handle(
    new Request("http://" + process.env.HOST + ":" + process.env.PORT + "/upload", {
      method: "POST",
    })
  );
  expect(response.status).toBe(401);
});
