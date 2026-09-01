import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getDb } from "./db";
import { slugify } from "./slug";
import { defaultOrientation } from "./video";
import type { Category, Orientation, Work, WorkType } from "./types";

const VALID_CATEGORIES: Category[] = [
  "Commercial",
  "Narrative",
  "Social",
  "Music",
];

function rowToWork(r: any): Work {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title ?? ""),
    titleEn: String(r.title_en ?? ""),
    category: (VALID_CATEGORIES.includes(r.category) ? r.category : "Social") as Category,
    workType: (r.work_type === "personal" ? "personal" : "work") as WorkType,
    year: r.year == null ? null : Number(r.year),
    videoUrl: r.video_url ?? null,
    videoFile: r.video_file ?? null,
    orientation: (r.orientation === "horizontal" ? "horizontal" : "vertical") as Orientation,
    coverImage: r.cover_image ?? null,
    description: String(r.description ?? ""),
    featured: Number(r.featured) === 1,
    featuredOrder: r.featured_order == null ? null : Number(r.featured_order),
    order: Number(r.order ?? 0),
  };
}

/* ───────────────────────── 公開讀取 ───────────────────────── */

export async function getAllWorks(): Promise<Work[]> {
  const db = await getDb();
  const res = await db.execute(
    `SELECT * FROM works ORDER BY "order" ASC, created_at ASC`
  );
  return res.rows.map(rowToWork);
}

export async function getFeaturedWorks(limit?: number): Promise<Work[]> {
  const all = await getAllWorks();
  const featured = all
    .filter((w) => w.featured)
    // 有手動排過（featuredOrder 非 null）的先比，沒排過的用清單 order 墊底
    .sort((a, b) => {
      const ao = a.featuredOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.featuredOrder ?? Number.MAX_SAFE_INTEGER;
      return ao !== bo ? ao - bo : a.order - b.order;
    });
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT * FROM works WHERE slug = ? LIMIT 1`,
    args: [slug],
  });
  return res.rows[0] ? rowToWork(res.rows[0]) : null;
}

export async function getAllSlugs(): Promise<string[]> {
  const all = await getAllWorks();
  return all.map((w) => w.slug);
}

/* ───────────────────────── 後台 CRUD ───────────────────────── */

export async function getWorkById(id: string): Promise<Work | null> {
  const db = await getDb();
  const res = await db.execute({
    sql: `SELECT * FROM works WHERE id = ? LIMIT 1`,
    args: [id],
  });
  return res.rows[0] ? rowToWork(res.rows[0]) : null;
}

export type WorkInput = {
  title: string;
  titleEn: string;
  category: Category;
  workType: WorkType;
  year: number | null;
  videoUrl: string | null;
  videoFile: string | null;
  orientation?: Orientation;
  coverImage: string | null;
  description: string;
  featured: boolean;
  order: number;
};

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = await getDb();
  let slug = base || "work";
  let i = 1;
  // 確認沒有其他作品用了相同 slug
  while (true) {
    const res = await db.execute({
      sql: `SELECT id FROM works WHERE slug = ? LIMIT 1`,
      args: [slug],
    });
    const row = res.rows[0] as any;
    if (!row || (excludeId && String(row.id) === excludeId)) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/work/[slug]", "page");
}

export async function createWork(input: WorkInput): Promise<string> {
  const db = await getDb();
  const id = randomUUID();
  const slug = await uniqueSlug(slugify(input.titleEn || input.title));
  const orientation = input.orientation ?? defaultOrientation(input.videoUrl);
  await db.execute({
    sql: `INSERT INTO works
      (id, slug, title, title_en, category, work_type, year, video_url, video_file, orientation, cover_image, description, featured, "order")
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id,
      slug,
      input.title,
      input.titleEn,
      input.category,
      input.workType,
      input.year,
      input.videoUrl,
      input.videoFile,
      orientation,
      input.coverImage,
      input.description,
      input.featured ? 1 : 0,
      input.order,
    ],
  });
  revalidatePublic();
  return id;
}

export async function updateWork(id: string, input: WorkInput): Promise<void> {
  const db = await getDb();
  const slug = await uniqueSlug(slugify(input.titleEn || input.title), id);
  const orientation = input.orientation ?? defaultOrientation(input.videoUrl);
  await db.execute({
    sql: `UPDATE works SET
      slug=?, title=?, title_en=?, category=?, work_type=?, year=?, video_url=?, video_file=?, orientation=?, cover_image=?, description=?, featured=?, "order"=?
      WHERE id=?`,
    args: [
      slug,
      input.title,
      input.titleEn,
      input.category,
      input.workType,
      input.year,
      input.videoUrl,
      input.videoFile,
      orientation,
      input.coverImage,
      input.description,
      input.featured ? 1 : 0,
      input.order,
      id,
    ],
  });
  revalidatePublic();
}

export async function deleteWork(id: string): Promise<void> {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM works WHERE id = ?`, args: [id] });
  revalidatePublic();
}

export async function updateWorkTitle(
  id: string,
  title: string,
  titleEn: string
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE works SET title=?, title_en=? WHERE id=?`,
    args: [title, titleEn, id],
  });
  revalidatePublic();
}

// 批次設定歸屬類型
export async function batchSetWorkType(
  ids: string[],
  workType: WorkType
): Promise<void> {
  const db = await getDb();
  await db.batch(
    ids.map((id) => ({
      sql: `UPDATE works SET work_type = ? WHERE id = ?`,
      args: [workType, id],
    })),
    "write"
  );
  revalidatePublic();
}

// 切換單一作品的首頁精選狀態（admin grid 直接點星星用，不用進 Edit 表單）
export async function setFeatured(id: string, featured: boolean): Promise<void> {
  const db = await getDb();
  if (featured) {
    // 新設為精選：如果還沒有 featuredOrder，排到目前精選清單最後面
    const res = await db.execute(
      `SELECT COALESCE(MAX(featured_order), -1) AS m FROM works WHERE featured = 1`
    );
    const nextOrder = Number((res.rows[0] as any).m) + 1;
    await db.execute({
      sql: `UPDATE works SET featured = 1, featured_order = COALESCE(featured_order, ?) WHERE id = ?`,
      args: [nextOrder, id],
    });
  } else {
    await db.execute({ sql: `UPDATE works SET featured = 0 WHERE id = ?`, args: [id] });
  }
  revalidatePublic();
}

// 批次更新排序：傳入 [{id, order}] 陣列，在單一 transaction 內完成
export async function reorderWorks(
  items: { id: string; order: number }[]
): Promise<void> {
  const db = await getDb();
  await db.batch(
    items.map(({ id, order }) => ({
      sql: `UPDATE works SET "order" = ? WHERE id = ?`,
      args: [order, id],
    })),
    "write"
  );
  revalidatePublic();
}

// 只調整首頁精選區塊內部的順序，跟作品清單的 order 脫鉤
export async function reorderFeatured(
  items: { id: string; featuredOrder: number }[]
): Promise<void> {
  const db = await getDb();
  await db.batch(
    items.map(({ id, featuredOrder }) => ({
      sql: `UPDATE works SET featured_order = ? WHERE id = ?`,
      args: [featuredOrder, id],
    })),
    "write"
  );
  revalidatePublic();
}
