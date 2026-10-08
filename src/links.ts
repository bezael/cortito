import type { Database } from "bun:sqlite";
import { generateCode } from "./code";

export type Link = {
  code: string;
  url: string;
  createdAt: string;
};

type LinkRow = { code: string; url: string; created_at: string };

const MAX_ATTEMPTS = 5;

export function createLink(db: Database, url: string): Link {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode();
    if (findLink(db, code)) continue;

    const createdAt = new Date().toISOString();
    db.query("INSERT INTO links (code, url, created_at) VALUES (?, ?, ?)").run(code, url, createdAt);
    return { code, url, createdAt };
  }
  throw new Error(`No se ha podido generar un código libre tras ${MAX_ATTEMPTS} intentos.`);
}

export function findLink(db: Database, code: string): Link | null {
  const row = db.query("SELECT code, url, created_at FROM links WHERE code = ?").get(code) as LinkRow | null;
  return row ? toLink(row) : null;
}

function toLink(row: LinkRow): Link {
  return { code: row.code, url: row.url, createdAt: row.created_at };
}
