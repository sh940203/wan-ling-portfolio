"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { reorderWorksAction, batchSetWorkTypeAction } from "@/app/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Work, WorkType } from "@/lib/types";
import { coverUrl } from "@/lib/cover";

type Props = { initialWorks: Work[] };

const TYPE_LABEL: Record<WorkType, string> = {
  work: "工作作品",
  personal: "個人作品",
};

export default function WorkGrid({ initialWorks }: Props) {
  const [works, setWorks] = useState(initialWorks);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── 拖曳排序 ──
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const from = result.source.index;
      const to = result.destination.index;
      if (from === to) return;

      const next = [...works];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setWorks(next);

      const items = next.map((w, i) => ({ id: w.id, order: i }));
      setSaving(true);
      setSaved(false);
      startTransition(async () => {
        await reorderWorksAction(items);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    },
    [works]
  );

  // ── 多選 ──
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(works.map((w) => w.id)));
  const clearSelect = () => setSelected(new Set());
  const exitBatchMode = () => { setBatchMode(false); setSelected(new Set()); };

  // ── 批次設定歸屬 ──
  const handleBatchType = (type: WorkType) => {
    const ids = [...selected];
    // 樂觀更新
    setWorks((prev) =>
      prev.map((w) => (selected.has(w.id) ? { ...w, workType: type } : w))
    );
    setSelected(new Set());
    startTransition(async () => {
      await batchSetWorkTypeAction(ids, type);
    });
  };

  const hasSelection = selected.size > 0;

  return (
    <div>
      {/* ── 狀態 / 批次工具列 ── */}
      <div className="mb-3 flex min-h-[40px] items-center gap-3">
        {batchMode ? (
          <>
            {hasSelection ? (
              <>
                <span className="text-[12px] text-text-secondary">
                  已選 {selected.size} 件
                </span>
                <div className="flex items-center gap-2">
                  {(["work", "personal"] as WorkType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleBatchType(t)}
                      className="rounded-full border-[0.5px] border-warm-border bg-warm-surface px-3 py-1 text-[11px] tracking-[0.04em] text-text-primary transition-colors hover:bg-warm-mid"
                    >
                      設為「{TYPE_LABEL[t]}」
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-[11px] tracking-[0.06em] text-text-muted">
                點選卡片以選取
              </span>
            )}
            <div className="ml-auto flex items-center gap-3">
              {hasSelection && (
                <button
                  onClick={selectAll}
                  className="text-[11px] text-text-muted hover:text-text-secondary"
                >
                  全選
                </button>
              )}
              <button
                onClick={exitBatchMode}
                className="text-[11px] text-text-muted hover:text-text-secondary"
              >
                完成
              </button>
            </div>
          </>
        ) : (
          <>
            {saving || isPending ? (
              <span className="text-[11px] tracking-[0.06em] text-text-muted">儲存中…</span>
            ) : saved ? (
              <span className="text-[11px] tracking-[0.06em] text-text-secondary">排序已儲存 ✓</span>
            ) : (
              <span className="text-[11px] tracking-[0.06em] text-text-muted">
                拖曳卡片調整順序
              </span>
            )}
            <button
              onClick={() => setBatchMode(true)}
              className="ml-auto rounded-full border-[0.5px] border-warm-border bg-warm-surface px-3 py-1 text-[11px] tracking-[0.04em] text-text-secondary transition-colors hover:bg-warm-mid"
            >
              批次編輯
            </button>
          </>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="works-grid" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            >
              {works.map((w, i) => {
                const cover = coverUrl(w);
                const isSelected = selected.has(w.id);

                return (
                  <Draggable key={w.id} draggableId={w.id} index={i}>
                    {(drag, snapshot) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={`group relative flex flex-col overflow-hidden rounded-lg border-[0.5px] transition-shadow ${
                          batchMode && isSelected
                            ? "border-text-primary ring-2 ring-text-primary/30"
                            : "border-warm-border"
                        } bg-warm-surface ${
                          snapshot.isDragging
                            ? "shadow-lg rotate-1"
                            : "hover:shadow-md"
                        }`}
                        style={drag.draggableProps.style}
                      >
                        {/* 封面縮圖（批次模式下點擊 = 選取；拖曳把手另外） */}
                        <div
                          className={`relative aspect-[9/16] w-full overflow-hidden bg-warm-deep ${batchMode ? "cursor-pointer" : "cursor-default"}`}
                          onClick={() => { if (batchMode) toggleSelect(w.id); }}
                        >
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-[10px] text-text-muted">No image</span>
                            </div>
                          )}

                          {/* 順序 badge */}
                          <span className="absolute left-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/50 px-1.5 text-[9px] font-medium text-white">
                            {i + 1}
                          </span>

                          {/* 歸屬 badge */}
                          {w.workType === "personal" && (
                            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] text-white">
                              個人
                            </span>
                          )}

                          {w.featured && (
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-white">
                              Featured
                            </span>
                          )}

                          {/* 勾選指示 */}
                          {batchMode && isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-text-primary">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* 拖曳把手 */}
                          <div
                            {...drag.dragHandleProps}
                            className="absolute bottom-1.5 right-1.5 rounded-full bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </div>
                        </div>

                        {/* 標題與操作 */}
                        <div className="flex flex-1 flex-col gap-1 p-2">
                          <p className="line-clamp-2 text-[11px] leading-[1.4] text-text-primary">
                            {w.titleEn || w.title || "(無標題)"}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {w.category}{w.year ? ` · ${w.year}` : ""}
                          </p>
                          <div className="mt-auto flex items-center gap-2 pt-1">
                            <Link
                              href={`/admin/works/${w.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] uppercase tracking-[0.08em] text-text-secondary transition-colors hover:text-text-primary"
                            >
                              Edit
                            </Link>
                            <DeleteButton id={w.id} />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
