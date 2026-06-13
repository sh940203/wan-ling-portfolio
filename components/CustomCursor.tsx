"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [ready, setReady] = useState(false);

  // Dot — snaps instantly
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);

  // Glow — floats behind with a very dreamy lag
  const gx = useSpring(mx, { stiffness: 22, damping: 9 });
  const gy = useSpring(my, { stiffness: 22, damping: 9 });

  // Inner glow — slightly faster than outer
  const igx = useSpring(mx, { stiffness: 38, damping: 11 });
  const igy = useSpring(my, { stiffness: 38, damping: 11 });

  useEffect(() => {
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
      {/* Outer bokeh — largest, slowest, most transparent */}
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9996] block -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: gx,
          y: gy,
          background:
            "radial-gradient(circle, rgba(210,194,174,0.22) 0%, rgba(197,180,154,0.10) 45%, transparent 72%)",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 160 : clicking ? 70 : 120,
          height: hovering ? 160 : clicking ? 70 : 120,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Inner bokeh — tighter, warmer, slightly faster */}
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9997] block -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: igx,
          y: igy,
          background:
            "radial-gradient(circle, rgba(191,169,143,0.38) 0%, rgba(191,155,120,0.16) 50%, transparent 72%)",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 72 : clicking ? 28 : 52,
          height: hovering ? 72 : clicking ? 28 : 52,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Precise dot — instant */}
      <motion.span
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] block -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5C4A3A]"
        style={{ x: mx, y: my }}
        animate={{
          opacity: visible ? 1 : 0,
          width: clicking ? 2 : hovering ? 3 : 4,
          height: clicking ? 2 : hovering ? 3 : 4,
          scale: clicking ? 0.6 : 1,
        }}
        transition={{ duration: 0.12 }}
      />
    </>
  );
}
