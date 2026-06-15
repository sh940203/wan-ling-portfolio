// One-off: swap hero cover ↔ about banner in the Turso settings row.
//   hero cover  -> graduation arms-crossed portrait, centered (portrait mode)
//   about banner -> seaside lifestyle photo (wide)
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

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
data.about = data.about || {};
console.log("before:", {
  heroPoster: data.hero.poster,
  heroStyle: data.hero.posterStyle,
  aboutPhoto: data.about.photo,
});

data.hero.poster = "/photo-portrait.jpg";
data.hero.posterStyle = "portrait";
data.about.photo = "/IMG_0557.jpg";

await db.execute({
  sql: `UPDATE settings SET value = ? WHERE key = 'site'`,
  args: [JSON.stringify(data)],
});
console.log("after: ", {
  heroPoster: data.hero.poster,
  heroStyle: data.hero.posterStyle,
  aboutPhoto: data.about.photo,
});
console.log("done.");
