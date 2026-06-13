"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BioTabs({ zh, en }: { zh: string; en: string }) {
  const [lang, setLang] = useState<"zh" | "en">("zh");

  return (
    <div>
      <div className="mb-5 inline-flex overflow-hidden rounded-full border-[0.5px] border-warm-border">
        {(["zh", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors ${
              lang === l
                ? "bg-text-primary text-on-dark"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {l === "zh" ? "中文" : "English"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={lang}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[14px] leading-[1.9] text-text-body"
        >
          {lang === "zh" ? zh : en}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
