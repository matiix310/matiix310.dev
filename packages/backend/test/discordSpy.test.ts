import { expect, test } from "bun:test";
import { app } from "../src";

test("GET    /ds/0", async () => {
  const response = await app.handle(
    new Request("http://" + process.env.HOST + ":" + process.env.PORT + "/ds/0")
  );
  expect(response.ok).toBeTrue();
});

test("GET    /ds/repports/0", async () => {
  const response = await app.handle(
    new Request("http://" + process.env.HOST + ":" + process.env.PORT + "/ds/repports/0")
  );
  expect(response.ok).toBeTrue();
});

test("GET    /ds/repports", async () => {
  const response = await app.handle(
    new Request("http://" + process.env.HOST + ":" + process.env.PORT + "/ds/repports")
  );
  expect(response.ok).toBeTrue();
});

test("POST   /ds/repports (empty body)", async () => {
  const response = await app.handle(
    new Request("http://" + process.env.HOST + ":" + process.env.PORT + "/ds/repports", {
      method: "POST",
    })
  );
  expect(response.ok).toBeTrue();
});

test("DELETE /ds/repports (empty body)", async () => {
  const response = await app.handle(
    new Request("http://" + process.env.HOST + ":" + process.env.PORT + "/ds/repports", {
      method: "DELETE",
    })
  );
  expect(response.ok).toBeTrue();
});
