import type { Database } from "bun:sqlite";
import { generateCode } from "./code";

export type Link = {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
};

type LinkRow = { code: string; url: string; clicks: number; created_at: string };

export function createLink(db: Database, url: string): Link {
  const code = generateCode(url);
  const createdAt = new Date().toISOString();
  db.query("INSERT INTO links (code, url, created_at) VALUES (?, ?, ?)").run(code, url, createdAt);
  return { code, url, clicks: 0, createdAt };
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
