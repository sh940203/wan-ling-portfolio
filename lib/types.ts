// 作品分類 — 對應 Notion 的 Select 欄位
export type Category = "Commercial" | "Narrative" | "Social" | "Music";

export const CATEGORIES: Category[] = [
  "Commercial",
  "Narrative",
  "Social",
  "Music",
];

// Work 列表頁 filter 用的選項（含 All）
export const WORK_FILTERS = ["All", ...CATEGORIES] as const;
export type WorkFilter = (typeof WORK_FILTERS)[number];

// 影片方向：直式（Instagram Reels / Shorts）或橫式（Vimeo 等）
export type Orientation = "vertical" | "horizontal";

// 一件作品的正規化型別（從 Notion page 或 seed 資料映射而來）
export interface Work {
  id: string;
  slug: string;
  /** 中文標題（Notion: title） */
  title: string;
  /** 英文標題（Notion: title_en） */
  titleEn: string;
  category: Category;
  /** 年份（Notion: year）；可能未填 */
  year: number | null;
  /** 影片連結：Instagram Reel 或 Vimeo（Notion: video_url / vimeo_url） */
  videoUrl: string | null;
  /** 直式 / 橫式，決定卡片與播放器比例 */
  orientation: Orientation;
  /** 封面圖 URL（Notion: cover_image 的第一個檔案）；Instagram 可留空用 embed */
  coverImage: string | null;
  /** 作品說明，中英各一段（Notion: description） */
  description: string;
  /** 是否顯示在首頁 Featured（Notion: featured） */
  featured: boolean;
  /** 排序，數字越小越前（Notion: order） */
  order: number;
}
