// One-off: point hero cover at IMG_0557.jpg in landscape mode (updates Turso DB row).
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

// load .env.local
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const res = await db.execute({ sql: `SELECT value FROM settings WHERE key = 'site' LIMIT 1` });
const row = res.rows[0];
if (!row) {
  console.log("No settings row — site uses lib/site.ts defaults already. Nothing to do.");
  process.exit(0);
}

const data = JSON.parse(String(row.value));
data.hero = data.hero || {};
console.log("before:", { poster: data.hero.poster, posterStyle: data.hero.posterStyle });
data.hero.poster = "/IMG_0557.jpg";
data.hero.posterStyle = "landscape";

await db.execute({
  sql: `UPDATE settings SET value = ? WHERE key = 'site'`,
  args: [JSON.stringify(data)],
});
console.log("after: ", { poster: data.hero.poster, posterStyle: data.hero.posterStyle });
console.log("done.");
