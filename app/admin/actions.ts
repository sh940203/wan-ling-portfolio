"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  checkPassword,
  createSession,
  destroySession,
  isAuthed,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  createWork,
  updateWork,
  deleteWork,
  updateWorkTitle,
  reorderWorks,
  reorderFeatured,
  batchSetWorkType,
  setFeatured,
  type WorkInput,
} from "@/lib/works";
import { getSettings, saveSettings } from "@/lib/settings";
import type { Category, Orientation, WorkType } from "@/lib/types";

async function requireAuth() {
  if (!(await isAuthed())) redirect("/admin/login");
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

const CATEGORIES: Category[] = ["Commercial", "Narrative", "Social", "Music"];
const WORK_TYPES: WorkType[] = ["work", "personal"];

/* ── 登入 / 登出 ── */

export async function loginAction(formData: FormData) {
  const pw = str(formData, "password");
  const from = str(formData, "from") || "/admin";

  // 防暴力破解：同一 IP 每 15 分鐘最多 8 次登入嘗試
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers().get("x-real-ip") ||
    "anon";
  const { success } = await rateLimit(`login:${ip}`, {
    max: 8,
    windowSec: 900,
  });
  if (!success) {
    redirect(`/admin/login?error=rate&from=${encodeURIComponent(from)}`);
  }

  if (!checkPassword(pw)) {
    redirect(`/admin/login?error=1&from=${encodeURIComponent(from)}`);
  }
  await createSession();
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAction() {
  destroySession();
  redirect("/admin/login");
}

/* ── 作品 CRUD ── */

function parseWorkInput(fd: FormData): WorkInput {
  const yearRaw = str(fd, "year");
  const orientationRaw = str(fd, "orientation");
  const category = CATEGORIES.includes(str(fd, "category") as Category)
    ? (str(fd, "category") as Category)
    : "Social";

  const workTypeRaw = str(fd, "workType");
  const workType: WorkType = WORK_TYPES.includes(workTypeRaw as WorkType)
    ? (workTypeRaw as WorkType)
    : "work";

  return {
    title: str(fd, "title"),
    titleEn: str(fd, "titleEn"),
    category,
    workType,
    year: yearRaw ? Number(yearRaw) : null,
    videoUrl: str(fd, "videoUrl") || null,
    videoFile: str(fd, "videoFile") || null,
    orientation:
      orientationRaw === "vertical" || orientationRaw === "horizontal"
        ? (orientationRaw as Orientation)
        : undefined,
    coverImage: str(fd, "coverImage") || null,
    description: String(fd.get("description") ?? "").trim(),
    featured: fd.get("featured") === "on",
    order: str(fd, "order") ? Number(str(fd, "order")) : 0,
  };
}

export async function saveWorkAction(formData: FormData) {
  await requireAuth();
  const id = str(formData, "id");
  const input = parseWorkInput(formData);
  if (!input.titleEn && !input.title) {
    redirect("/admin?error=title");
  }
  if (id) {
    await updateWork(id, input);
  } else {
    await createWork(input);
  }
  redirect("/admin?saved=1");
}

export async function deleteWorkAction(formData: FormData) {
  await requireAuth();
  const id = str(formData, "id");
  if (id) await deleteWork(id);
  redirect("/admin?deleted=1");
}

/* ── 批次更新作品標題 ── */

export async function batchUpdateTitlesAction(formData: FormData) {
  await requireAuth();
  const ids = formData.getAll("id") as string[];
  await Promise.all(
    ids.map((id) =>
      updateWorkTitle(
        id,
        String(formData.get(`title_${id}`) ?? "").trim(),
        String(formData.get(`titleEn_${id}`) ?? "").trim()
      )
    )
  );
  redirect("/admin/works/batch?saved=1");
}

/* ── 站台設定 ── */

export async function saveSettingsAction(formData: FormData) {
  await requireAuth();
  const s = await getSettings();

  s.name.zh = str(formData, "name.zh") || s.name.zh;
  s.name.en = str(formData, "name.en") || s.name.en;
  s.name.brand = str(formData, "name.brand") || s.name.brand;
  s.role.en = str(formData, "role.en") || s.role.en;
  s.role.zh = str(formData, "role.zh") || s.role.zh;

  s.email = str(formData, "email") || s.email;
  s.phone = str(formData, "phone");
  s.socials.instagram = str(formData, "socials.instagram");
  s.socials.linkedin = str(formData, "socials.linkedin");

  s.hero.subtitle = str(formData, "hero.subtitle");
  s.hero.videoUrl = str(formData, "hero.videoUrl");
  s.workIntro = str(formData, "workIntro");

  s.about.photo = str(formData, "about.photo");
  s.about.headshot = str(formData, "about.headshot");
  s.about.bioZh = String(formData.get("about.bioZh") ?? "").trim();
  s.about.bioEn = String(formData.get("about.bioEn") ?? "").trim();
  s.about.skills = str(formData, "about.skills")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // 重點數據卡
  s.about.highlight.number = str(formData, "about.highlight.number");
  s.about.highlight.unit = str(formData, "about.highlight.unit");
  s.about.highlight.subLabel = str(formData, "about.highlight.subLabel");
  s.about.highlight.homeLabel = str(formData, "about.highlight.homeLabel");
  s.about.highlight.title = str(formData, "about.highlight.title");
  s.about.highlight.linkText = str(formData, "about.highlight.linkText");
  s.about.highlight.url = str(formData, "about.highlight.url");

  // About 頁履歷區 + 聯絡呼籲
  for (const k of ["title", "subtitle", "buttonLabel"] as const) {
    const v = str(formData, `about.resume.${k}`);
    if (v) s.about.resume[k] = v;
  }
  for (const k of ["kicker", "heading", "buttonLabel"] as const) {
    const v = str(formData, `about.cta.${k}`);
    if (v) s.about.cta[k] = v;
  }

  // 文字標籤 / 用詞：留空則保留預設
  for (const k of Object.keys(s.labels) as (keyof typeof s.labels)[]) {
    const v = str(formData, `labels.${k}`);
    if (v) s.labels[k] = v;
  }

  // Experience / Awards 照片：來自結構化編輯器，值是 hidden 欄位裡的 JSON 字串
  const parseList = (key: string, errTag: string): unknown[] | undefined => {
    const raw = String(formData.get(key) ?? "").trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      redirect(`/admin/settings?error=${errTag}`);
    }
  };
  const exp = parseList("about.experienceJson", "experience");
  if (exp) {
    s.about.experience = exp
      .map((r) => (r ?? {}) as Record<string, string>)
      .filter((r) => r.role || r.org || r.desc) as typeof s.about.experience;
  }
  const awardPhotos = parseList("about.awardPhotosJson", "awardPhotos");
  if (awardPhotos) {
    s.about.awardPhotos = awardPhotos
      .map((r) => (r ?? {}) as Record<string, string>)
      .filter((r) => r.src) as typeof s.about.awardPhotos;
  }

  s.contact.headline = str(formData, "contact.headline");
  s.contact.subtitleZh = String(
    formData.get("contact.subtitleZh") ?? ""
  ).trim();

  s.resumeUrl = str(formData, "resumeUrl") || s.resumeUrl;

  await saveSettings(s);
  redirect("/admin/settings?saved=1");
}

/* ── 作品拖曳排序 ── */

export async function batchSetWorkTypeAction(
  ids: string[],
  workType: WorkType
): Promise<{ ok: boolean }> {
  await requireAuth();
  if (!Array.isArray(ids) || ids.length === 0) return { ok: false };
  if (!WORK_TYPES.includes(workType)) return { ok: false };
  await batchSetWorkType(ids, workType);
  return { ok: true };
}

export async function toggleFeaturedAction(
  id: string,
  featured: boolean
): Promise<{ ok: boolean }> {
  await requireAuth();
  if (!id) return { ok: false };
  await setFeatured(id, Boolean(featured));
  return { ok: true };
}

export async function reorderWorksAction(
  items: { id: string; order: number }[]
): Promise<{ ok: boolean }> {
  await requireAuth();
  if (!Array.isArray(items) || items.length === 0) return { ok: false };
  // 驗證每個 item 格式
  for (const item of items) {
    if (typeof item.id !== "string" || typeof item.order !== "number") {
      return { ok: false };
    }
  }
  await reorderWorks(items);
  return { ok: true };
}

export async function reorderFeaturedAction(
  items: { id: string; featuredOrder: number }[]
): Promise<{ ok: boolean }> {
  await requireAuth();
  if (!Array.isArray(items) || items.length === 0) return { ok: false };
  for (const item of items) {
    if (typeof item.id !== "string" || typeof item.featuredOrder !== "number") {
      return { ok: false };
    }
  }
  await reorderFeatured(items);
  return { ok: true };
}
