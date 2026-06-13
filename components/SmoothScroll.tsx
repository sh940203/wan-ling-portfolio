"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Apple 官網式的平滑慣性捲動。
// - 桌機滑鼠/觸控板：Lenis 慣性平滑
// - 手機觸控：用原生捲動（手感最好），scroll-linked 動畫照常運作
// - prefers-reduced-motion：完全停用
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic，柔順收尾
      smoothWheel: true,
      syncTouch: false, // 手機用原生捲動
      touchMultiplier: 1.2,
    });

    // 提供給其他元件（例如 Hero 的 scroll cue）使用
    (window as any).__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // 站內錨點連結改用 Lenis 平滑捲動
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -40 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      (window as any).__lenis = undefined;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
