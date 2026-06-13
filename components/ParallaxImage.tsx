"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";

// scroll-linked 視差圖片。圖片比容器高 24%，在 ±amount 範圍內位移而不露邊。
export default function ParallaxImage({
  src,
  alt = "",
  className = "",
  amount = 30,
}: {
  src: string;
  alt?: string;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={src}
        alt={alt}
        style={reduce ? undefined : { y }}
        className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
      />
    </div>
  );
}
