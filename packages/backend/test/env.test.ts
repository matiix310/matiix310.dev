import { expect, test } from "bun:test";
import { readdirSync } from "fs";

console.log("$NODE_ENV =", process.env.NODE_ENV);

test("Environement variables", () => {
  // Base folder path environement variable
  expect(process.env.BASE_FOLDER).toBeDefined();
  expect(readdirSync(process.env.BASE_FOLDER ?? "BASE_FOLDER not defined")).toBeDefined();

  // Backend base folder path environement variable
  expect(process.env.BACKEND_BASE_FOLDER).toBeDefined();
  expect(
    readdirSync(process.env.BACKEND_BASE_FOLDER ?? "BACKEND_BASE_FOLDER not defined")
  ).toBeDefined();

  // Download path environement variable
  expect(process.env.DOWNLOADS_FOLDER).toBeDefined();
  expect(
    readdirSync(
      process.env.BASE_FOLDER! + process.env.DOWNLOADS_FOLDER ??
        "DOWNLOADS_FOLDER not defined"
    )
  ).toBeDefined();

  // Music path environement variable
  expect(process.env.MUSICS_FOLDER).toBeDefined();
  expect(
    readdirSync(
      process.env.BASE_FOLDER! + process.env.MUSICS_FOLDER ?? "MUSICS_FOLDER not defined"
    )
  ).toBeDefined();

  // Log path environement variable
  expect(process.env.LOGS_FOLDER).toBeDefined();
  expect(
    readdirSync(
      process.env.BASE_FOLDER! + process.env.LOGS_FOLDER ?? "LOGS_FOLDER not defined"
    )
  ).toBeDefined();

  // Host environement variable
  expect(process.env.HOST).toBeDefined();

  // Port environement variable
  expect(process.env.PORT).toBeDefined();

  // TLS environement variable
  expect(process.env.TLS).toBeDefined();
});
