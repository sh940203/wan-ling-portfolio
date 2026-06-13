import { revalidatePath } from "next/cache";
import { getDb } from "./db";
import { site as defaults } from "./site";

export type SiteSettings = typeof defaults;

const KEY = "site";

function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// 深層合併：物件遞迴合併，陣列/純值直接覆蓋
function deepMerge<T>(base: T, override: any): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override ?? base) as T;
  }
  const out: any = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = deepMerge((base as any)[k], override[k]);
  }
  return out as T;
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const db = await getDb();
    const res = await db.execute({
      sql: `SELECT value FROM settings WHERE key = ? LIMIT 1`,
      args: [KEY],
    });
    const row = res.rows[0] as any;
    if (!row) return defaults;
    const override = JSON.parse(String(row.value));
    return deepMerge(defaults, override);
  } catch {
    return defaults;
  }
}

export async function saveSettings(next: SiteSettings): Promise<void> {
  const db = await getDb();
  // 存合併後的完整設定，未來程式新增的欄位仍可由 defaults 補上
  const merged = deepMerge(defaults, next);
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [KEY, JSON.stringify(merged)],
  });
  revalidatePath("/", "layout");
}
