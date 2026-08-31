"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderWorksAction, batchSetWorkTypeAction } from "@/app/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Work, WorkType } from "@/lib/types";
import { coverUrl } from "@/lib/cover";

type Props = { initialWorks: Work[] };

const TYPE_LABEL: Record<WorkType, string> = {
  work: "工作作品",
  personal: "個人作品",
};

// ── 卡片外觀（純顯示，不含 dnd hook）──────────────────────────────
function CardFace({
  work,
  index,
  batchMode,
  isSelected,
  pressing,
  isDragging,
  overlay,
  pointerHandlers,
  dndAttributes,
  onToggle,
}: {
  work: Work;
  index: number;
  batchMode: boolean;
  isSelected: boolean;
  pressing: boolean;
  isDragging: boolean;
  overlay: boolean;
  pointerHandlers: Record<string, unknown>;
  dndAttributes: Record<string, unknown>;
  onToggle: (id: string) => void;
}) {
  const cover = coverUrl(work);

  const cardCls = [
    "group relative flex flex-col overflow-hidden rounded-xl border-[0.5px] bg-warm-surface",
    batchMode && isSelected
      ? "border-text-primary ring-2 ring-text-primary/30"
      : "border-warm-border",
    overlay
      ? "shadow-2xl rotate-2 scale-[1.07] opacity-[0.97]"
      : isDragging
      ? "opacity-25 scale-[0.97] border-dashed shadow-none"
      : pressing
      ? "shadow-2xl scale-[1.05] border-warm-mid"
      : "hover:shadow-md",
    "transition-all duration-150 ease-out will-change-transform",
  ].join(" ");

  return (
    <div className={cardCls}>
      {/* 縮圖區域 */}
      <div
        {...dndAttributes}
        {...pointerHandlers}
        onClick={() => { if (batchMode) onToggle(work.id); }}
        className={[
          "relative aspect-[9/16] w-full overflow-hidden bg-warm-deep select-none",
          batchMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        ].join(" ")}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            draggable={false}
            className="h-full w-full object-cover pointer-events-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[10px] text-text-muted">No image</span>
          </div>
        )}

        {/* 順序 badge */}
        {!overlay && (
          <span className="absolute left-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black/50 px-1.5 text-[9px] font-medium text-white">
            {index + 1}
          </span>
        )}

        {/* 歸屬 badge */}
        {work.workType === "personal" && (
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] text-white">
            個人
          </span>
        )}

        {work.featured && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-white">
            Featured
          </span>
        )}

        {/* 批次模式勾選 */}
        {batchMode && isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-text-primary">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* 長壓中 — 顯示拖曳提示 icon */}
        {!batchMode && pressing && !isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity">
            <svg className="h-7 w-7 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 9l4-4 4 4M8 15l4 4 4-4" />
            </svg>
          </div>
        )}
      </div>

      {/* 標題 + 操作列 */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        <p className="line-clamp-2 text-[11px] leading-[1.4] text-text-primary">
          {work.titleEn || work.title || "(無標題)"}
        </p>
        <p className="text-[10px] text-text-muted">
          {work.category}{work.year ? ` · ${work.year}` : ""}
        </p>
        {!overlay && (
          <div className="mt-auto flex items-center gap-2 pt-1">
            <Link
              href={`/admin/works/${work.id}/edit`}
              className="text-[10px] uppercase tracking-[0.08em] text-text-secondary transition-colors hover:text-text-primary"
            >
              Edit
            </Link>
            <DeleteButton id={work.id} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── 可排序卡片 ─────────────────────────────────────────────────────
function SortableCard({
  work,
  index,
  batchMode,
  isSelected,
  onToggle,
}: {
  work: Work;
  index: number;
  batchMode: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: work.id, disabled: batchMode });

  const [pressing, setPressing] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
  };

  // 長壓視覺回饋：80ms 後開始放大，等 dnd-kit 的 250ms 延遲啟動拖曳
  const mergedPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (batchMode) return;
      (listeners as Record<string, (e: unknown) => void>)?.onPointerDown?.(e);
      pressTimer.current = setTimeout(() => setPressing(true), 80);
    },
    [batchMode, listeners]
  );

  const clearPress = useCallback(() => {
    clearTimeout(pressTimer.current);
    setPressing(false);
  }, []);

  const pointerHandlers = {
    onPointerDown: mergedPointerDown,
    onPointerUp: clearPress,
    onPointerCancel: clearPress,
    onPointerLeave: clearPress,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CardFace
        work={work}
        index={index}
        batchMode={batchMode}
        isSelected={isSelected}
        pressing={pressing}
        isDragging={isDragging}
        overlay={false}
        pointerHandlers={pointerHandlers}
        dndAttributes={!batchMode ? attributes : {}}
        onToggle={onToggle}
      />
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────
export default function WorkGrid({ initialWorks }: Props) {
  const [works, setWorks] = useState(initialWorks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 感應器：滑鼠長壓 250ms / 觸控 200ms 後啟動拖曳，移動超過 5px 以上才算
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      if (!over || active.id === over.id) return;

      const oldIndex = works.findIndex((w) => w.id === active.id);
      const newIndex = works.findIndex((w) => w.id === over.id);
      const next = arrayMove(works, oldIndex, newIndex);
      setWorks(next);

      setSaving(true);
      setSaved(false);
      startTransition(async () => {
        await reorderWorksAction(next.map((w, i) => ({ id: w.id, order: i })));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    },
    [works]
  );

  const handleDragCancel = () => setActiveId(null);

  // ── 批次選取 ──
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAll = () => setSelected(new Set(works.map((w) => w.id)));
  const exitBatchMode = () => { setBatchMode(false); setSelected(new Set()); };

  const handleBatchType = (type: WorkType) => {
    const ids = [...selected];
    setWorks((prev) =>
      prev.map((w) => (selected.has(w.id) ? { ...w, workType: type } : w))
    );
    setSelected(new Set());
    startTransition(async () => {
      await batchSetWorkTypeAction(ids, type);
    });
  };

  const hasSelection = selected.size > 0;
  const activeWork = activeId ? works.find((w) => w.id === activeId) ?? null : null;

  return (
    <div>
      {/* 工具列 */}
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
                <button onClick={selectAll} className="text-[11px] text-text-muted hover:text-text-secondary">
                  全選
                </button>
              )}
              <button onClick={exitBatchMode} className="text-[11px] text-text-muted hover:text-text-secondary">
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
                長壓卡片拖曳調整順序
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={works.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {works.map((w, i) => (
              <SortableCard
                key={w.id}
                work={w}
                index={i}
                batchMode={batchMode}
                isSelected={selected.has(w.id)}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        </SortableContext>

        {/* 拖曳中浮動卡片（跟隨滑鼠移動） */}
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
          {activeWork ? (
            <CardFace
              work={activeWork}
              index={works.findIndex((w) => w.id === activeWork.id)}
              batchMode={false}
              isSelected={false}
              pressing={false}
              isDragging={false}
              overlay
              pointerHandlers={{}}
              dndAttributes={{}}
              onToggle={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
