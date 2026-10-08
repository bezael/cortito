import type { Database } from "bun:sqlite";
import { generateCode } from "./code";

export type Link = {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
};

type LinkRow = { code: string; url: string; clicks: number; created_at: string };

const MAX_ATTEMPTS = 5;

function isHttpUrl(value: string): boolean {
  if (value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function createLink(db: Database, url: string): Link {
  if (!isHttpUrl(url)) {
    throw new Error(`URL no permitida: ${url}`);
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode();
    if (findLink(db, code)) continue;

    const createdAt = new Date().toISOString();
    db.query("INSERT INTO links (code, url, created_at) VALUES (?, ?, ?)").run(code, url, createdAt);
    return { code, url, clicks: 0, createdAt };
  }
  throw new Error(`No se ha podido generar un código libre tras ${MAX_ATTEMPTS} intentos.`);
}

export function findLink(db: Database, code: string): Link | null {
  const row = db.query("SELECT code, url, clicks, created_at FROM links WHERE code = ?").get(code) as LinkRow | null;
  return row ? toLink(row) : null;
}

export function registerClick(db: Database, code: string): Link | null {
  const row = db
    .query("UPDATE links SET clicks = clicks + 1 WHERE code = ? RETURNING code, url, clicks, created_at")
    .get(code) as LinkRow | null;
  return row ? toLink(row) : null;
}

function toLink(row: LinkRow): Link {
  return { code: row.code, url: row.url, clicks: row.clicks, createdAt: row.created_at };
}
