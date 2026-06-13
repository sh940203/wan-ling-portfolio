import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Edge-safe（可在 middleware 使用）：只依賴 jose
export const COOKIE_NAME = "admin_session";

function secret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
  );
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
