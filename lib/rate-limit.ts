import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 統一速率限制：偵測到 Upstash 環境變數就用 Redis（跨 serverless 實例共用、可靠），
// 否則自動退回「記憶體版」滑動視窗（零設定，適合本地與低流量）。
// 記憶體版的限制：Vercel 多實例/冷啟動時狀態不共用，無法 100% 擋住分散式攻擊，
// 但已能大幅提高單一來源暴力破解的成本。要正式級防護就設 Upstash 環境變數。

export type RateResult = { success: boolean; remaining: number; reset: number };

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? Redis.fromEnv() : null;
const upstashCache = new Map<string, Ratelimit>();

function upstashLimiter(max: number, windowSec: number): Ratelimit {
  const id = `${max}:${windowSec}`;
  let rl = upstashCache.get(id);
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix: "rl",
      analytics: false,
    });
    upstashCache.set(id, rl);
  }
  return rl;
}

// ── 記憶體版滑動視窗 ──
const memHits = new Map<string, number[]>();

function memoryLimit(key: string, max: number, windowSec: number): RateResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const arr = (memHits.get(key) ?? []).filter((t) => now - t < windowMs);
  const success = arr.length < max;
  if (success) arr.push(now);
  memHits.set(key, arr);

  // 偶發清理，避免 Map 無限成長
  if (memHits.size > 5000) {
    for (const [k, v] of memHits) {
      if (v.every((t) => now - t > windowMs)) memHits.delete(k);
    }
  }

  const reset = (arr[0] ?? now) + windowMs;
  return { success, remaining: Math.max(0, max - arr.length), reset };
}

/**
 * 對某個 key（通常是 IP + 動作名）做速率限制。
 * @param key      識別字串，例如 `login:1.2.3.4`
 * @param max      視窗內允許的最大次數
 * @param windowSec 視窗長度（秒）
 */
export async function rateLimit(
  key: string,
  { max, windowSec }: { max: number; windowSec: number }
): Promise<RateResult> {
  if (hasUpstash && redis) {
    const r = await upstashLimiter(max, windowSec).limit(key);
    return { success: r.success, remaining: r.remaining, reset: r.reset };
  }
  return memoryLimit(key, max, windowSec);
}

// 從 fetch Request 取用戶端 IP（Vercel 會帶 x-forwarded-for）
export function ipFromRequest(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || req.headers.get("x-real-ip") || "anon").trim();
}
