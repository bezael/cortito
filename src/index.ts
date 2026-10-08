import { createApp } from "./app";
import { openDb } from "./db";

const port = Number(process.env.PORT ?? 3000);
const db = openDb(process.env.DB_PATH ?? "cortito.sqlite");
const app = createApp(db, { baseUrl: process.env.BASE_URL });

console.log(`cortito escuchando en http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
