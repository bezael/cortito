import { Database } from "bun:sqlite";

export function openDb(path = ":memory:"): Database {
  const db = new Database(path, { create: true, strict: true });
  db.run("PRAGMA journal_mode = WAL");
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      code       TEXT PRIMARY KEY,
      url        TEXT NOT NULL,
      clicks     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  return db;
}
