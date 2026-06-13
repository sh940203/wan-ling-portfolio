"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { navLinks, site } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Nav({ brand = site.name.brand }: { brand?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 border-b-[0.5px] border-warm-border bg-warm-bg/90 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-10">
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

          {/* Hamburger — animates to × */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 flex-col items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute h-[1.5px] w-5 bg-text-primary"
            />
            <motion.span
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute h-[1.5px] w-5 bg-text-primary"
              style={{ y: 0 }}
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute h-[1.5px] w-5 bg-text-primary"
            />
          </button>
        </nav>
      </header>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Blurred + dimmed backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed inset-0 z-40 md:hidden"
              style={{
                background: "rgba(92,74,58,0.22)",
                backdropFilter: "blur(18px) saturate(0.75)",
                WebkitBackdropFilter: "blur(18px) saturate(0.75)",
                top: "56px", // below sticky header
              }}
              onClick={() => setOpen(false)}
            />

            {/* Menu panel — slides up from bottom edge of header */}
            <motion.div
              key="panel"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed inset-x-0 z-50 md:hidden"
              style={{ top: "56px" }}
            >
              <ul className="flex flex-col items-center justify-center gap-0 pt-[12vh] pb-16">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    transition={{
                      duration: 0.55,
                      ease: EASE,
                      delay: reduce ? 0 : 0.06 + i * 0.07,
                    }}
                    className="w-full max-w-xs"
                  >
                    <Link
                      href={link.href}
                      className="group flex w-full items-baseline justify-between border-b-[0.5px] border-warm-border/40 px-8 py-5"
                      onClick={() => setOpen(false)}
                    >
                      <span
                        className={`display text-[32px] tracking-[0.03em] transition-colors duration-150 ${
                          isActive(link.href)
                            ? "text-text-primary"
                            : "text-text-secondary group-hover:text-text-primary"
                        }`}
                      >
                        {link.label}
                      </span>
                      <span className="mb-1 text-[11px] tracking-[0.1em] text-text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
