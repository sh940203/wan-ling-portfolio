import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { COOKIE_NAME, signSession, verifyToken } from "./auth-core";

export async function createSession(): Promise<void> {
  const token = await signSession();
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession(): void {
  cookies().delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return (await verifyToken(token)) !== null;
}

// 驗證後台密碼。未設定 ADMIN_PASSWORD 時：開發環境預設 "admin"，正式環境一律拒絕。
export function checkPassword(pw: string): boolean {
  if (!pw) return false;
  const expected =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : "admin");
  if (!expected) return false;
  // 常數時間比對，避免以回應時間差推測密碼（timing attack）。
  // 長度不同時用 expected 自我比對，讓「長度錯誤」與「內容錯誤」耗時一致。
  const a = Buffer.from(pw);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
