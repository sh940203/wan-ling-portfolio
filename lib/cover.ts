import type { Work } from "./types";
import { getInstagramShortcode, getProvider } from "./video";

// 決定一件作品的封面圖：明確指定 > Instagram 自動縮圖（經 /api/ig-cover 代理）> 無
export function coverUrl(work: Work): string | null {
  if (work.coverImage) return work.coverImage;
  if (getProvider(work.videoUrl) === "instagram") {
    const code = getInstagramShortcode(work.videoUrl);
    if (code) return `/api/ig-cover/${code}`;
  }
  return null;
}
