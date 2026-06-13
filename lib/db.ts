import { createClient, type Client } from "@libsql/client";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { sampleWorks } from "./sample-works";

// 本地預設用檔案資料庫（零設定）；上線設 DATABASE_URL=libsql://... + DATABASE_AUTH_TOKEN
function resolveUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  // 預設：專案根目錄下 .data/portfolio.db
  const dir = path.join(process.cwd(), ".data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return `file:${path.join(dir, "portfolio.db")}`;
}

const g = globalThis as unknown as {
  __dbClient?: Client;
  __dbInit?: Promise<void>;
};

function client(): Client {
  if (!g.__dbClient) {
    g.__dbClient = createClient({
      url: resolveUrl(),
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return g.__dbClient;
}

async function ensureSchema(c: Client) {
  // build 時多個 worker 會同時存取檔案資料庫，設定 busy_timeout 讓寫入排隊而非報錯
  try {
    await c.execute("PRAGMA busy_timeout = 15000");
  } catch {
    /* Turso 等遠端可能不支援，略過 */
  }
  await c.batch(
    [
      `CREATE TABLE IF NOT EXISTS works (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        title_en TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'Social',
        year INTEGER,
        video_url TEXT,
        orientation TEXT NOT NULL DEFAULT 'vertical',
        cover_image TEXT,
        description TEXT NOT NULL DEFAULT '',
        featured INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
    ],
    "write"
  );
}

async function seedIfEmpty(c: Client) {
  const res = await c.execute(`SELECT COUNT(*) AS n FROM works`);
  const n = Number((res.rows[0] as any).n ?? 0);
  if (n > 0) return;

  for (const w of sampleWorks) {
    await c.execute({
      // OR IGNORE：避免並發 seeding 造成主鍵衝突
      sql: `INSERT OR IGNORE INTO works
        (id, slug, title, title_en, category, year, video_url, orientation, cover_image, description, featured, "order")
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        w.id,
        w.slug,
        w.title,
        w.titleEn,
        w.category,
        w.year,
        w.videoUrl,
        w.orientation,
        w.coverImage,
        w.description,
        w.featured ? 1 : 0,
        w.order,
      ],
    });
  }
}

// 確保 schema 與初始資料只建立一次
export async function getDb(): Promise<Client> {
  const c = client();
  if (!g.__dbInit) {
    g.__dbInit = (async () => {
      await ensureSchema(c);
      await seedIfEmpty(c);
    })().catch((e) => {
      // 失敗時清掉，讓下次重試
      g.__dbInit = undefined;
      throw e;
    });
  }
  await g.__dbInit;
  return c;
}
