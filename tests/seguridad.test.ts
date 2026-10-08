import { describe, expect, test } from "bun:test";
import { makeApp, shorten } from "./helpers";

// Regresión del bug del capítulo 10: la app aceptaba javascript:alert(1).
describe("solo se guardan URLs http y https", () => {
  test("rechaza javascript:alert(1)", async () => {
    const res = await shorten(makeApp(), "javascript:alert(1)");

    expect(res.status).toBe(400);
  });

  test("rechaza otros esquemas que sí se pueden parsear", async () => {
    const app = makeApp();
    const urls = ["data:text/html,<script>alert(1)</script>", "ftp://example.com/archivo", "file:///C:/Windows/win.ini", "mailto:hola@dominicode.com"];

    for (const url of urls) {
      const res = await shorten(app, url);
      expect(res.status, url).toBe(400);
    }
  });
});
