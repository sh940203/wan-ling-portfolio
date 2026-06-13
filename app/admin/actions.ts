"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  createSession,
  destroySession,
  isAuthed,
} from "@/lib/auth";
import {
  createWork,
  updateWork,
  deleteWork,
  updateWorkTitle,
  type WorkInput,
} from "@/lib/works";
import { getSettings, saveSettings } from "@/lib/settings";
import type { Category, Orientation } from "@/lib/types";

async function requireAuth() {
  if (!(await isAuthed())) redirect("/admin/login");
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

const CATEGORIES: Category[] = ["Commercial", "Narrative", "Social", "Music"];

/* ── 登入 / 登出 ── */

export async function loginAction(formData: FormData) {
  const pw = str(formData, "password");
  const from = str(formData, "from") || "/admin";
  if (!checkPassword(pw)) {
    redirect(
      `/admin/login?error=1&from=${encodeURIComponent(from)}`
    );
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

  return {
    title: str(fd, "title"),
    titleEn: str(fd, "titleEn"),
    category,
    year: yearRaw ? Number(yearRaw) : null,
    videoUrl: str(fd, "videoUrl") || null,
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
  s.about.bioZh = String(formData.get("about.bioZh") ?? "").trim();
  s.about.bioEn = String(formData.get("about.bioEn") ?? "").trim();
  s.about.skills = str(formData, "about.skills")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Experience 以 JSON 編輯（解析失敗則保留原值）
  const expRaw = String(formData.get("about.experienceJson") ?? "").trim();
  if (expRaw) {
    try {
      const parsed = JSON.parse(expRaw);
      if (Array.isArray(parsed)) s.about.experience = parsed;
    } catch {
      redirect("/admin/settings?error=experience");
    }
  }

  s.contact.headline = str(formData, "contact.headline");
  s.contact.subtitleZh = String(
    formData.get("contact.subtitleZh") ?? ""
  ).trim();

  s.resumeUrl = str(formData, "resumeUrl") || s.resumeUrl;

  await saveSettings(s);
  redirect("/admin/settings?saved=1");
}
