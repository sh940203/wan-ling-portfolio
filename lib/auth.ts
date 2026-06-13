import { cookies } from "next/headers";
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
  return pw === expected;
}
