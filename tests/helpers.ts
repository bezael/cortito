import { createApp } from "../src/app";
import { openDb } from "../src/db";

export function makeApp() {
  return createApp(openDb(":memory:"), { baseUrl: "http://localhost:3000" });
}

export type TestApp = ReturnType<typeof makeApp>;

export function shorten(app: TestApp, url: unknown) {
  return app.request("/api/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
}
