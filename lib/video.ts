import type { Orientation } from "./types";

export type VideoProvider = "instagram" | "vimeo" | "unknown";

export function getProvider(url: string | null | undefined): VideoProvider {
  if (!url) return "unknown";
  if (/instagram\.com/.test(url)) return "instagram";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return "unknown";
}

// 從 Instagram reel / p / tv 連結抽出 shortcode
export function getInstagramShortcode(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const m = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// 從 Vimeo 連結抽出 id（含 unlisted hash）
export function getVimeoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  if (!m) return null;
  return m[2] ? `${m[1]}?h=${m[2]}` : m[1];
}

// 統一回傳可嵌入的播放器 URL
export function getEmbedUrl(
  url: string | null | undefined,
  opts: { autoplay?: boolean } = {}
): string | null {
  const provider = getProvider(url);
  if (provider === "instagram") {
    const code = getInstagramShortcode(url);
    return code ? `https://www.instagram.com/reel/${code}/embed/` : null;
  }
  if (provider === "vimeo") {
    const id = getVimeoId(url);
    if (!id) return null;
    const [videoId, query] = id.split("?");
    const params = new URLSearchParams(query);
    params.set("title", "0");
    params.set("byline", "0");
    params.set("portrait", "0");
    params.set("dnt", "1");
    if (opts.autoplay) params.set("autoplay", "1");
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }
  return null;
}

// 預設方向：Instagram 直式、其餘橫式
export function defaultOrientation(
  url: string | null | undefined
): Orientation {
  return getProvider(url) === "instagram" ? "vertical" : "horizontal";
}
