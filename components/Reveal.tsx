"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** 延遲毫秒，用於 stagger */
  delay?: number;
  as?: "div" | "section" | "li";
  /** 位移距離（px），預設 28 */
  y?: number;
};

// 進入 viewport 時平滑淡入上移（Apple 式 ease-out 曲線）。
// 尊重 prefers-reduced-motion：直接顯示、不位移。
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
  y = 28,
}: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1], // easeOutExpo 風格
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </MotionTag>
  );
}
