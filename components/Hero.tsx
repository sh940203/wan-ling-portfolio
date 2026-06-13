"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from "framer-motion";

export type HeroSlide =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string };

type HeroProps = {
  slides: HeroSlide[];
  name: string;
  fullName?: string;
  subtitle: string;
};

// Warm bokeh orbs — placed at varying CSS depths (translateZ) for 3D parallax
const ORBS = [
  { x: "4%",  y: "-12%", size: 480, blur: 90,  color: "#D9C9B5", z: -120, opacity: 0.65 },
  { x: "68%", y: "50%",  size: 300, blur: 70,  color: "#C5B49A", z:  60,  opacity: 0.55 },
  { x: "38%", y: "-8%",  size: 420, blur: 110, color: "#EDE4D8", z: -220, opacity: 0.50 },
  { x: "-6%", y: "48%",  size: 340, blur: 75,  color: "#BFA98F", z:  90,  opacity: 0.42 },
  { x: "72%", y: "-18%", size: 270, blur: 55,  color: "#CCBBA3", z: -55,  opacity: 0.58 },
  { x: "28%", y: "72%",  size: 200, blur: 45,  color: "#D9C9B5", z:  110, opacity: 0.45 },
  { x: "55%", y: "28%",  size: 160, blur: 35,  color: "#E8DDD0", z: -80,  opacity: 0.50 },
] as const;

export default function Hero({ slides, name, fullName, subtitle }: HeroProps) {
  const [active, setActive] = useState(0);
  const count = slides.length;
  const hasMedia = count > 0;
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll-linked parallax (existing)
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Mouse-driven 3D tilt for orbs
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 40, damping: 18 });
  const tiltY = useSpring(rawTiltY, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      rawTiltY.set((e.clientX / window.innerWidth  - 0.5) *  9);
      rawTiltX.set((e.clientY / window.innerHeight - 0.5) * -5);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, rawTiltX, rawTiltY]);

  // Slide carousel
  useEffect(() => {
    if (count <= 1 || reduce) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), 2000);
    return () => clearInterval(id);
  }, [count, reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-warm-mid"
      style={{
        backgroundImage:
          "radial-gradient(120% 80% at 30% 20%, #F0E8DC 0%, #E8DDD0 38%, #DDD0C0 72%, #D2C2AE 100%)",
      }}
    >
      {/* ── 3D Bokeh Orb Layer ── */}
      {!hasMedia && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
        >
          <motion.div
            style={
              reduce
                ? undefined
                : { rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }
            }
            className="absolute inset-0"
          >
            {ORBS.map((orb, i) => (
              <div
                key={i}
                aria-hidden
                className="absolute rounded-full"
                style={{
                  left: orb.x,
                  top: orb.y,
                  width: orb.size,
                  height: orb.size,
                  background: orb.color,
                  filter: `blur(${orb.blur}px)`,
                  transform: `translateZ(${orb.z}px)`,
                  opacity: orb.opacity,
                }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* ── Media background (video / image) ── */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: bgY, scale: bgScale }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-soft ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.type === "video" ? (
              <video
                className="h-full w-full object-cover"
                src={slide.src}
                poster={slide.poster}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.src}
                alt=""
                className={`h-full w-full object-cover ${
                  i === active && !reduce
                    ? "animate-[kenburns_8s_ease-out_both]"
                    : ""
                }`}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Warm overlay for media backgrounds */}
      {hasMedia && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(92,74,58,0.10) 0%, transparent 40%, rgba(92,74,58,0.40) 100%)",
          }}
        />
      )}

      {/* ── Central name (scroll parallax + fade-in) ── */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={reduce ? undefined : { y: nameY, opacity: nameOpacity }}
      >
        {/* Brand name with 3D float on mouse move (subtle depth) */}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY }}
          className={`display text-[52px] leading-none tracking-[0.06em] sm:text-[72px] md:text-[96px] ${
            hasMedia
              ? "text-on-dark drop-shadow-[0_2px_24px_rgba(92,74,58,0.45)]"
              : "text-text-primary"
          }`}
        >
          {name}
        </motion.h1>

        {fullName && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className={`mt-3 text-[13px] tracking-[0.18em] ${
              hasMedia ? "text-on-dark/70" : "text-text-secondary"
            }`}
          >
            {fullName}
          </motion.p>
        )}

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
          className={`mt-2 text-[10px] uppercase tracking-[0.28em] ${
            hasMedia ? "text-on-dark/60" : "text-text-muted"
          }`}
        >
          {subtitle}
        </motion.p>

        {/* Floating vertical line accent */}
        {!hasMedia && (
          <motion.div
            initial={reduce ? false : { scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            style={{ originY: 0 }}
            className="mt-10 h-12 w-px bg-gradient-to-b from-text-primary/40 to-transparent"
          />
        )}
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#selected-works"
        style={reduce ? undefined : { opacity: cueOpacity }}
        className={`absolute bottom-6 right-5 z-10 text-[10px] uppercase tracking-[0.18em] transition-colors md:right-10 ${
          hasMedia
            ? "text-on-dark/70 hover:text-on-dark"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        scroll to explore ↓
      </motion.a>

      {/* Carousel dots */}
      {count > 1 && (
        <motion.div
          style={reduce ? undefined : { opacity: cueOpacity }}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2.5"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-on-dark"
                  : "w-1.5 bg-on-dark/45 hover:bg-on-dark/70"
              }`}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
