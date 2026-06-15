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
  posterStyle?: "landscape" | "portrait";
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

export default function Hero({ slides, name, fullName, subtitle, posterStyle = "portrait" }: HeroProps) {
  const [active, setActive] = useState(0);
  const count = slides.length;
  const hasMedia = count > 0;
  const hasVideo = slides.some((s) => s.type === "video");
  // cinematic = video / landscape poster: dark full-bleed + gradient overlay
  // portrait  = studio photo: centered figure on warm bg, mix-blend multiply
  const isCinematic = hasMedia && (hasVideo || posterStyle === "landscape");
  const isPortrait = hasMedia && !hasVideo && posterStyle === "portrait";
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const nameY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Mouse-driven 3D tilt for orbs (no-media mode only)
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

  // Mobile gyroscope — drives the same bokeh tilt as mouse on desktop
  useEffect(() => {
    if (reduce || hasMedia) return; // bokeh orbs only exist in no-media mode
    if (typeof window === "undefined") return;

    const handle = (e: DeviceOrientationEvent) => {
      if (e.gamma === null) return;
      const gamma = Math.max(-45, Math.min(45, e.gamma ?? 0));          // left-right
      const beta  = Math.max(-45, Math.min(45, (e.beta ?? 45) - 45));  // offset from natural hold
      rawTiltY.set(gamma * 0.2);
      rawTiltX.set(beta  * -0.12);
    };

    // iOS 13+ requires explicit permission from a user gesture; try silently first
    const DevOri = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DevOri.requestPermission === "function") {
      DevOri.requestPermission()
        .then((s) => {
          if (s === "granted")
            window.addEventListener("deviceorientation", handle, true);
        })
        .catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handle, true);
    }

    return () => window.removeEventListener("deviceorientation", handle, true);
  }, [reduce, hasMedia, rawTiltX, rawTiltY]);

  useEffect(() => {
    if (count <= 1 || reduce) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), 2000);
    return () => clearInterval(id);
  }, [count, reduce]);

  const portraitSlide = isPortrait ? slides[active] : null;
  const portraitSrc = portraitSlide?.type === "image" ? portraitSlide.src : "";

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-warm-mid"
      style={{
        backgroundImage:
          "radial-gradient(120% 80% at 30% 20%, #F0E8DC 0%, #E8DDD0 38%, #DDD0C0 72%, #D2C2AE 100%)",
      }}
    >
      {/* ── Bokeh orbs — only when no media (pure warm abstract bg) ── */}
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

      {/* ── Portrait mode: warm radial spotlight behind subject ── */}
      {isPortrait && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 65% 75% at 50% 36%, rgba(208,188,162,0.52) 0%, transparent 68%)",
          }}
        />
      )}

      {/* ── Portrait mode: centered figure, bottom-anchored, fades into warm bg ── */}
      {isPortrait && portraitSrc && (
        <div className="absolute inset-x-0 bottom-0 z-[2] flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitSrc}
            alt=""
            className="block"
            style={{
              height: "auto",
              width: "auto",
              maxHeight: "84vh",
              maxWidth: "100%",
              mixBlendMode: "multiply",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 58%, transparent 92%)",
              maskImage:
                "linear-gradient(to bottom, black 58%, transparent 92%)",
            }}
          />
        </div>
      )}

      {/* ── Cinematic mode: full-bleed video / image background ── */}
      {isCinematic && (
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
                  className="h-full w-full object-cover object-top"
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
                  style={{ objectPosition: "40% 42%" }}
                />
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Gradient overlay — darker for video, lighter/warmer for landscape photo */}
      {isCinematic && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background: hasVideo
              ? "linear-gradient(to bottom, rgba(6,4,2,0.06) 0%, transparent 26%, rgba(6,4,2,0.48) 60%, rgba(6,4,2,0.78) 82%, rgba(6,4,2,0.88) 100%)"
              : "linear-gradient(to bottom, rgba(12,8,4,0) 0%, rgba(12,8,4,0.08) 35%, rgba(12,8,4,0.38) 65%, rgba(12,8,4,0.65) 85%, rgba(12,8,4,0.75) 100%)",
          }}
        />
      )}

      {/* Letterbox bars — video cinematic only */}
      {isCinematic && hasVideo && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-0 z-20"
            style={{ height: "46px", background: "rgba(5,3,1,0.92)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
            style={{ height: "46px", background: "rgba(5,3,1,0.92)" }}
          />
        </>
      )}

      {/* ── Name / subtitle text ── */}
      <motion.div
        className={`relative z-30 flex h-full flex-col items-center px-6 text-center ${
          isCinematic
            ? "justify-end pb-16 md:pb-[72px]"
            : isPortrait
            ? "justify-end pb-10 md:pb-14"
            : "justify-center"
        }`}
        style={reduce ? undefined : { y: nameY, opacity: nameOpacity }}
      >
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={
            reduce || isCinematic || isPortrait
              ? undefined
              : { rotateX: tiltX, rotateY: tiltY }
          }
          className={`display leading-none tracking-[0.06em] ${
            isCinematic
              ? "text-[38px] text-white sm:text-[50px] md:text-[66px]"
              : "text-[52px] text-text-primary sm:text-[72px] md:text-[96px]"
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
              isCinematic ? "text-white/70" : "text-text-secondary"
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
            isCinematic ? "text-white/55" : "text-text-muted"
          }`}
        >
          {subtitle}
        </motion.p>

        {/* Floating vertical line — no-media mode only */}
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
        className={`absolute z-30 text-[10px] uppercase tracking-[0.18em] transition-colors ${
          isCinematic && hasVideo
            ? "bottom-[54px] right-5 text-white/60 hover:text-white md:right-10"
            : isCinematic
            ? "bottom-6 right-5 text-white/60 hover:text-white md:right-10"
            : "bottom-6 right-5 text-text-muted hover:text-text-primary md:right-10"
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
