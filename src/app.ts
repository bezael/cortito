import type { Database } from "bun:sqlite";
import { Hono } from "hono";
import { createLink, findLink } from "./links";
import { validateUrl } from "./validation";

const CODE_PATTERN = "{[A-Za-z0-9]{6}}";

export type AppOptions = {
  baseUrl?: string;
};

export function createApp(db: Database, options: AppOptions = {}) {
  const app = new Hono();

  app.post("/api/links", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = validateUrl(body?.url);
    if (!result.ok) {
      return c.json({ error: result.error }, 400);
    }

    const link = createLink(db, result.value);
    const baseUrl = options.baseUrl ?? new URL(c.req.url).origin;
    return c.json({ code: link.code, shortUrl: `${baseUrl}/${link.code}` }, 201);
  });

  app.get(`/:code${CODE_PATTERN}`, (c) => {
    const link = findLink(db, c.req.param("code"));
    if (!link) {
      return c.json({ error: "Ese enlace no existe." }, 404);
    }
    return c.redirect(link.url, 302);
  });

  return app;
}
