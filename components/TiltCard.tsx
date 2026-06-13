"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";

export default function TiltCard({
  children,
  className = "",
  maxTilt = 10,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springCfg = { stiffness: 280, damping: 26 };
  const rotX = useSpring(
    useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]),
    springCfg
  );
  const rotY = useSpring(
    useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]),
    springCfg
  );
  const scale = useSpring(1, springCfg);

  const glareGradient = useTransform(
    [glareX, glareY] as MotionValue<number>[],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,248,240,0.22) 0%, transparent 68%)`
  );

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rawX.set(px - 0.5);
    rawY.set(py - 0.5);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }

  function onLeave() {
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
  }

  function onEnter() {
    scale.set(1.03);
  }

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} style={{ perspective: "900px" }} className={`relative ${className}`}>
      <motion.div
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          scale,
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
        {/* Glare sheen */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-md"
          style={{ background: glareGradient }}
        />
      </motion.div>
    </div>
  );
}
