// Importa enlaces desde un archivo de texto con una URL por línea.
// Uso: bun src/import-links.ts enlaces.txt
import { openDb } from "./db";
import { createLink } from "./links";

function isHttpUrl(value: string): boolean {
  if (value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const file = process.argv[2];
if (!file) {
  console.error("Uso: bun src/import-links.ts <archivo>");
  process.exit(1);
}

const db = openDb(process.env.DB_PATH ?? "cortito.sqlite");
const lines = (await Bun.file(file).text()).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

let imported = 0;
for (const line of lines) {
  if (!isHttpUrl(line)) {
    console.warn(`Ignorada (no es http/https): ${line}`);
    continue;
  }
  const link = createLink(db, new URL(line).href);
  console.log(`${link.code}  ${link.url}`);
  imported++;
}

console.log(`Importados ${imported} de ${lines.length} enlaces.`);
