import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth-core";

// 保護 /admin（登入頁除外）
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyToken(token);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
