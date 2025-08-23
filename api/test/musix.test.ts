import { expect, test } from "bun:test";
import { app } from "../src";

test("GET    /musix/download/0", async () => {
  const response = await app.handle(
    new Request(
      "http://" + process.env.HOST + ":" + process.env.PORT + "/musix/download/0"
    )
  );
  expect(response.ok).toBeTrue();
});
