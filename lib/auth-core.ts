import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Edge-safe（可在 middleware 使用）：只依賴 jose
export const COOKIE_NAME = "admin_session";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  // 正式環境一定要設一個夠長的隨機密鑰；缺少或太短一律報錯，
  // 絕不退回任何硬編碼預設值（否則公開原始碼的人就能偽造管理員 token）。
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET 未設定或過短：正式環境必須設定 ≥32 字元的隨機字串（openssl rand -base64 32）"
      );
    }
    // 僅本地開發時為了方便而提供固定密鑰
    return new TextEncoder().encode("dev-insecure-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(
  token: string | undefined | null
): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}
