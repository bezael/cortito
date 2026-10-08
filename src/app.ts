import type { Database } from "bun:sqlite";
import { join } from "node:path";
import { Hono } from "hono";
import { createLink, findLink, registerClick } from "./links";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");
const CODE_PATTERN = "{[A-Za-z0-9]{6}}";

export type AppOptions = {
  baseUrl?: string;
};

function isHttpUrl(value: string): boolean {
  if (value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function createApp(db: Database, options: AppOptions = {}) {
  const app = new Hono();

  app.get("/", async (c) => c.html(await Bun.file(join(PUBLIC_DIR, "index.html")).text()));

  app.get("/styles.css", (c) => {
    c.header("content-type", "text/css; charset=utf-8");
    return c.body(Bun.file(join(PUBLIC_DIR, "styles.css")).stream());
  });

  app.post("/api/links", async (c) => {
    const body = await c.req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!isHttpUrl(url)) {
      return c.json({ error: "La URL no es válida. Solo se aceptan URLs http o https." }, 400);
    }

    const link = createLink(db, new URL(url).href);
    const baseUrl = options.baseUrl ?? new URL(c.req.url).origin;
    return c.json({ code: link.code, shortUrl: `${baseUrl}/${link.code}` }, 201);
  });

  app.get(`/api/links/:code${CODE_PATTERN}/stats`, (c) => {
    const link = findLink(db, c.req.param("code"));
    if (!link) {
      return c.json({ error: "Ese enlace no existe." }, 404);
    }
    return c.json({ url: link.url, clicks: link.clicks, createdAt: link.createdAt });
  });

  app.get(`/:code${CODE_PATTERN}`, (c) => {
    const link = registerClick(db, c.req.param("code"));
    if (!link) {
      return c.json({ error: "Ese enlace no existe." }, 404);
    }
    return c.redirect(link.url, 302);
  });

  return app;
}
