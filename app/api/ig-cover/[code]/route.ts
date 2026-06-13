import { NextResponse } from "next/server";

// 取回 Instagram 貼文/Reel 的封面縮圖。
// 透過 IG 的 /p/{code}/media/?size=l 端點（會 302 導向當前縮圖），由伺服器抓取
// 後轉送並加上 CDN 快取。抓不到時回傳暖色系 SVG 佔位圖。

export const revalidate = 21600;

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function placeholderSvg(): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="800" viewBox="0 0 450 800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#E8DDD0"/>
        <stop offset="1" stop-color="#DDD0C0"/>
      </linearGradient>
    </defs>
    <rect width="450" height="800" fill="url(#g)"/>
    <circle cx="225" cy="400" r="34" fill="#FBF7F2" opacity="0.85"/>
    <path d="M214 384 L214 416 L242 400 Z" fill="#5C4A3A"/>
  </svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // 不快取失敗結果，讓下次載入重試（IG 偶爾會限流）
      "Cache-Control": "no-store",
    },
  });
}

async function fetchThumb(code: string): Promise<Response | null> {
  const res = await fetch(`https://www.instagram.com/p/${code}/media/?size=l`, {
    headers: { "User-Agent": UA },
    redirect: "follow",
    next: { revalidate: 21600 },
  });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.startsWith("image")) return null;
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": type || "image/jpeg",
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code?.replace(/[^A-Za-z0-9_-]/g, "");
  if (!code) return NextResponse.json({ error: "bad code" }, { status: 400 });

  // 最多試兩次（IG 偶爾限流）
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const img = await fetchThumb(code);
      if (img) return img;
    } catch {
      /* 重試 */
    }
  }
  return placeholderSvg();
}
