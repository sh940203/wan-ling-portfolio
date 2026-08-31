"use client";

import { useMemo, useState } from "react";
import WorkCard from "./WorkCard";
import Chip from "./ui/Chip";
import { Stagger, StaggerItem } from "./Stagger";
import type { Work, WorkFilter, WorkType } from "@/lib/types";

const TAB_LABELS: Record<WorkType | "all", string> = {
  all: "全部",
  work: "工作作品",
  personal: "個人作品",
};

export default function WorkGrid({ works }: { works: Work[] }) {
  const [tab, setTab] = useState<WorkType | "all">("all");
  const [filter, setFilter] = useState<WorkFilter>("All");

  // 決定顯示哪些 tab（只顯示實際有作品的）
  const availableTabs = useMemo<(WorkType | "all")[]>(() => {
    const types = new Set(works.map((w) => w.workType));
    const tabs: (WorkType | "all")[] = ["all"];
    if (types.has("work")) tabs.push("work");
    if (types.has("personal")) tabs.push("personal");
    return tabs;
  }, [works]);

  const showTabs = availableTabs.length > 2; // 只有同一種時不顯示 tab

  // 當前 tab 的作品
  const tabWorks = useMemo(
    () => (tab === "all" ? works : works.filter((w) => w.workType === tab)),
    [works, tab]
  );

  // 當前 tab 內有哪些 category
  const filters = useMemo<WorkFilter[]>(() => {
    const present = new Set(tabWorks.map((w) => w.category));
    const ordered = (
      ["Commercial", "Narrative", "Social", "Music"] as const
    ).filter((c) => present.has(c));
    return ["All", ...ordered];
  }, [tabWorks]);

  // filter 切 tab 時重置
  const handleTabChange = (t: WorkType | "all") => {
    setTab(t);
    setFilter("All");
  };

  const visible = useMemo(
    () =>
      filter === "All"
        ? tabWorks
        : tabWorks.filter((w) => w.category === filter),
    [tabWorks, filter]
  );

  const showFilter = filters.length > 2;

  return (
    <div>
      {/* ── Tab 切換 ── */}
      {showTabs && (
        <div className="mb-8 flex gap-1 border-b-[0.5px] border-warm-border">
          {availableTabs.map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`relative pb-3 pr-6 text-[13px] tracking-[0.04em] transition-colors ${
                tab === t
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {TAB_LABELS[t]}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-6 h-[1.5px] bg-text-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Category filter chips ── */}
      {showFilter && (
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
      )}

      {/* ── 作品網格 ── */}
      <Stagger
        key={`${tab}-${filter}`}
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
