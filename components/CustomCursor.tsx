"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [ready, setReady] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(mx, { damping: 22, stiffness: 260 });
  const ry = useSpring(my, { damping: 22, stiffness: 260 });

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setReady(true);

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const over = (e: MouseEvent) => {
      setHovering(!!(e.target as Element)?.closest("a,button,[role=button]"));
    };

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    document.addEventListener("mouseover", over, { passive: true });

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("mouseover", over);
    };
  }, [mx, my]);

  if (!ready) return null;

  return (
    <>
      {/* Precise dot */}
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5C4A3A]"
        style={{ x: mx, y: my }}
        animate={{ opacity: visible ? 1 : 0, scale: clicking ? 0.5 : 1 }}
        transition={{ duration: 0.1 }}
      />
      {/* Lagging ring */}
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] block -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5C4A3A]/40"
        style={{ x: rx, y: ry }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 54 : clicking ? 16 : 34,
          height: hovering ? 54 : clicking ? 16 : 34,
          borderColor: hovering
            ? "rgba(92,74,58,0.75)"
            : "rgba(92,74,58,0.35)",
        }}
        transition={{ duration: 0.18 }}
      />
    </>
  );
}
