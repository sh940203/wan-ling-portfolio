import Link from "next/link";
import type { Metadata } from "next";
import { isAuthed } from "@/lib/auth";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin — WAN-LING",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthed();

  return (
    <div className="min-h-screen bg-warm-bg">
      {authed && (
        <header className="sticky top-0 z-40 border-b-[0.5px] border-warm-border bg-warm-bg/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="display text-[15px] tracking-[0.12em] text-text-primary"
              >
                ADMIN
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
                >
                  Works
                </Link>
                <Link
                  href="/admin/works/batch"
                  className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
                >
                  Batch
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
                >
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-[11px] uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
              >
                View site ↗
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-[11px] uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-text-primary"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-4xl px-5 py-10">{children}</main>
    </div>
  );
}
