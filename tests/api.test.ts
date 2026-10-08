import { beforeEach, describe, expect, test } from "bun:test";
import { makeApp, shorten, type TestApp } from "./helpers";

let app: TestApp;

beforeEach(() => {
  app = makeApp();
});

describe("POST /api/links", () => {
  test("crea un enlace y devuelve code y shortUrl", async () => {
    const res = await shorten(app, "https://dominicode.com");

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.shortUrl).toBe(`http://localhost:3000/${body.code}`);
  });

  test("el código tiene 6 caracteres alfanuméricos", async () => {
    const { code } = await (await shorten(app, "https://dominicode.com/cursos")).json();

    expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
  });

  test("rechaza una URL no válida con 400", async () => {
    const res = await shorten(app, "esto no es una url");

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeString();
  });

  test("rechaza una petición sin url con 400", async () => {
    const res = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /:code", () => {
  test("redirige con 302 a la URL original", async () => {
    const { code } = await (await shorten(app, "https://dominicode.com/blog")).json();

    const res = await app.request(`/${code}`);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://dominicode.com/blog");
  });

  test("devuelve 404 si el código no existe", async () => {
    const res = await app.request("/noexis");

    expect(res.status).toBe(404);
  });
});
