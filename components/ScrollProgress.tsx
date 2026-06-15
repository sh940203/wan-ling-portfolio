"use client";

import { useScroll, useSpring, motion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[200] h-[2.5px] w-full origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(to right, #C8A07A 0%, #8B5E3C 55%, #52321A 100%)",
      }}
    />
  );
}
