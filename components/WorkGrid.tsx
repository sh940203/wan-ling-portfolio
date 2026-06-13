"use client";

import { useMemo, useState } from "react";
import WorkCard from "./WorkCard";
import Chip from "./ui/Chip";
import { Stagger, StaggerItem } from "./Stagger";
import type { Work, WorkFilter } from "@/lib/types";

export default function WorkGrid({ works }: { works: Work[] }) {
  const [filter, setFilter] = useState<WorkFilter>("All");

  // 只顯示實際有作品的分類做為 filter
  const filters = useMemo<WorkFilter[]>(() => {
    const present = Array.from(new Set(works.map((w) => w.category)));
    const ordered = (["Commercial", "Narrative", "Social", "Music"] as const)
      .filter((c) => present.includes(c));
    return ["All", ...ordered];
  }, [works]);

  const visible = useMemo(
    () => (filter === "All" ? works : works.filter((w) => w.category === filter)),
    [works, filter]
  );

  return (
    <div>
      {/* filter tags */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Chip
            key={f}
            as="button"
            active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </Chip>
        ))}
      </div>

      {/* 直式 Reels 網格（錯落浮現） */}
      <Stagger
        key={filter}
        stagger={0.05}
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {visible.map((work) => (
          <StaggerItem key={work.id}>
            <WorkCard work={work} />
          </StaggerItem>
        ))}
      </Stagger>

      {visible.length === 0 && (
        <p className="py-16 text-center text-[14px] text-text-secondary">
          這個分類目前沒有作品。
        </p>
      )}
    </div>
  );
}
