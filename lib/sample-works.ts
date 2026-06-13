import type { Category, Work } from "./types";
import { slugify } from "./slug";

// ─────────────────────────────────────────────────────────────────
// 江婉綾的真實作品 — 為「日昀美睫 Riyun Eyelash」剪輯的 Instagram Reels。
// 沒設定 Notion 時，全站直接用這份資料。
//
// 之後要改：編輯下面每一筆的 title / titleEn / category / featured。
// 要換成自己的封面圖：把圖放到 public/covers/ 後填 cover（例如 "/covers/01.jpg"）。
// 不填 cover 也沒關係 — 作品內頁會直接嵌入 Instagram 原始 Reel。
// ─────────────────────────────────────────────────────────────────

type Seed = {
  code: string; // Instagram reel shortcode
  title: string; // 中文標題
  titleEn: string; // 英文標題（也用來產生網址）
  category: Category;
  featured?: boolean;
  cover?: string; // 可選封面圖路徑/網址
};

const reels: Seed[] = [
  { code: "DXB-wV6kdaX", title: "日昀美睫 No.01", titleEn: "Riyun Eyelash 01", category: "Social", featured: true },
  { code: "DUX4DpMEQ2r", title: "日昀美睫 No.02", titleEn: "Riyun Eyelash 02", category: "Social", featured: true },
  { code: "DKZOs7TRtia", title: "日昀美睫 No.03", titleEn: "Riyun Eyelash 03", category: "Social", featured: true },
  { code: "DYelpbPxA0G", title: "日昀美睫 No.04", titleEn: "Riyun Eyelash 04", category: "Social", featured: true },
  { code: "DYJMMQzRaYY", title: "日昀美睫 No.05", titleEn: "Riyun Eyelash 05", category: "Social" },
  { code: "DXhL_bXEfyA", title: "日昀美睫 No.06", titleEn: "Riyun Eyelash 06", category: "Social" },
  { code: "DXG5xCUkV2k", title: "日昀美睫 No.07", titleEn: "Riyun Eyelash 07", category: "Social" },
  { code: "DWGhBoBkWfN", title: "日昀美睫 No.08", titleEn: "Riyun Eyelash 08", category: "Social" },
  { code: "DTengLOkdOB", title: "日昀美睫 No.09", titleEn: "Riyun Eyelash 09", category: "Social" },
  { code: "DS2HTfhEer0", title: "日昀美睫 No.10", titleEn: "Riyun Eyelash 10", category: "Social" },
  { code: "DSZokzAESmr", title: "日昀美睫 No.11", titleEn: "Riyun Eyelash 11", category: "Social" },
  { code: "DSUmoZ1EZsY", title: "日昀美睫 No.12", titleEn: "Riyun Eyelash 12", category: "Social" },
  { code: "DRmIGiQETVP", title: "日昀美睫 No.13", titleEn: "Riyun Eyelash 13", category: "Social" },
  { code: "DQv1_uPEV_U", title: "日昀美睫 No.14", titleEn: "Riyun Eyelash 14", category: "Social" },
  { code: "DOGgf2AkhmI", title: "日昀美睫 No.15", titleEn: "Riyun Eyelash 15", category: "Social" },
  { code: "DN7x36hkczu", title: "日昀美睫 No.16", titleEn: "Riyun Eyelash 16", category: "Social" },
];

export const sampleWorks: Work[] = reels.map((r, i) => ({
  id: r.code,
  slug: slugify(r.titleEn) || r.code,
  title: r.title,
  titleEn: r.titleEn,
  category: r.category,
  year: null,
  videoUrl: `https://www.instagram.com/reel/${r.code}/`,
  orientation: "vertical",
  coverImage: r.cover ?? null,
  description:
    "為日昀美睫剪輯的社群短影音，以暖色調與輕快節奏呈現美睫服務的質感。\nA social reel edited for Riyun Eyelash, presenting the craft of eyelash styling with warm tones and a light, rhythmic cut.",
  featured: Boolean(r.featured),
  order: i + 1,
}));
