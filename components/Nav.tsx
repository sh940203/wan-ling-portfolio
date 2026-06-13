"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";

export default function Nav({ brand = site.name.brand }: { brand?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 關閉 overlay 當路由改變
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // overlay 開啟時鎖住背景捲動
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b-[0.5px] border-warm-border bg-warm-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="display text-[16px] tracking-[0.14em] text-text-primary"
          aria-label={`${brand} — Home`}
        >
          {brand}
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-[11px] uppercase tracking-[0.12em] transition-colors duration-150 ${
                  isActive(link.href)
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`h-[1.5px] w-5 bg-text-primary transition-transform duration-200 ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-text-primary transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-text-primary transition-transform duration-200 ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile full-page overlay */}
      <div
        className={`fixed inset-0 top-14 z-40 bg-warm-bg transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center justify-center gap-8 pt-[20vh]">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`display text-[28px] tracking-[0.04em] ${
                  isActive(link.href) ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
