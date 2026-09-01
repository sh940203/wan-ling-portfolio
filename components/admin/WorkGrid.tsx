"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
  type DraggableAttributes,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderWorksAction, batchSetWorkTypeAction, toggleFeaturedAction } from "@/app/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Work, WorkType } from "@/lib/types";
import { coverUrl } from "@/lib/cover";

type Props = { initialWorks: Work[] };

const TYPE_LABEL: Record<WorkType, string> = {
  work: "工作作品",
  personal: "個人作品",
};

// ── IG 風格正方形格子（純顯示）──────────────────────────────────────
interface CellProps {
  work: Work;
  index: number;
  batchMode: boolean;
  isSelected: boolean;
  pressing: boolean;
  isDragging: boolean;
  overlay: boolean;
  pointerHandlers: Record<string, unknown>;
  dndAttrs: DraggableAttributes | Record<string, never>;
  onToggle: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

function Cell({
  work, index, batchMode, isSelected, pressing, isDragging,
  overlay, pointerHandlers, dndAttrs, onToggle, onToggleFeatured,
}: CellProps) {
  const cover = coverUrl(work);

  const wrapCls = [
    "relative aspect-square overflow-hidden group bg-warm-deep",
    overlay
      ? "shadow-2xl scale-[1.07] rotate-[2deg] opacity-[0.96] z-50"
      : isDragging
      ? "opacity-10"
      : pressing
      ? "scale-[1.04] shadow-2xl z-10"
      : "",
    "transition-all duration-[80ms] ease-out will-change-transform",
    !batchMode && !overlay ? "cursor-grab active:cursor-grabbing" : "",
    batchMode ? "cursor-pointer" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={wrapCls}
      {...dndAttrs}
      {...pointerHandlers}
      onClick={() => { if (batchMode) onToggle(work.id); }}
    >
      {/* 封面圖 */}
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          draggable={false}
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-text-muted text-[9px]">No image</span>
        </div>
      )}

      {/* 一般模式操作層：觸控裝置常駐、桌機 hover 顯示；按鈕放大到好按的尺寸 */}
      {!batchMode && !overlay && (
        <div className="absolute inset-0 flex flex-col justify-between p-1.5 md:bg-black/45 md:opacity-0 md:transition-opacity md:duration-150 md:group-hover:opacity-100">
          {/* 手機用底部漸層增加對比（桌機 hover 時整片變暗，不需要） */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent md:hidden" />

          {/* 上方：featured 星星（可直接點切換，不用進 Edit）+ 歸屬標記 */}
          <div className="relative flex items-start justify-end gap-1">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(work.id);
              }}
              aria-pressed={work.featured}
              aria-label={work.featured ? "取消首頁精選" : "設為首頁精選"}
              title={work.featured ? "取消首頁精選" : "設為首頁精選"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-[15px] leading-none backdrop-blur-sm transition active:scale-90 hover:bg-black/60"
            >
              <span className={work.featured ? "text-amber-300" : "text-white/60"}>★</span>
            </button>
            {work.workType === "personal" && (
              <span className="rounded bg-black/55 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em] text-white backdrop-blur-sm">
                個人
              </span>
            )}
          </div>

          {/* 下方：標題 + 操作按鈕 */}
          <div className="relative flex flex-col gap-1.5">
            <p className="line-clamp-1 text-[11px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {work.titleEn || work.title}
            </p>
            <div className="flex items-stretch gap-1.5">
              <Link
                href={`/admin/works/${work.id}/edit`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-white text-[11px] font-semibold uppercase tracking-[0.1em] text-[#3a2e24] shadow-sm transition active:scale-95 hover:bg-white/90 md:h-9"
              >
                Edit
              </Link>
              <DeleteButton id={work.id} small />
            </div>
          </div>
        </div>
      )}

      {/* 順序 badge */}
      {!overlay && (
        <span className="absolute left-1 top-1 bg-black/50 text-white text-[8px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-medium leading-none">
          {index + 1}
        </span>
      )}

      {/* 批次選取覆蓋層 */}
      {batchMode && (
        <div className={[
          "absolute inset-0 transition-colors duration-100 flex items-center justify-center",
          isSelected ? "bg-black/40" : "bg-transparent hover:bg-black/10",
        ].join(" ")}>
          <div className={[
            "w-6 h-6 rounded-full border-2 border-white transition-all flex items-center justify-center",
            isSelected ? "bg-text-primary border-text-primary scale-110" : "bg-black/20",
          ].join(" ")}>
            {isSelected && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* 長壓中提示（drag 啟動前） */}
      {!batchMode && !overlay && pressing && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── 可排序格子 ──────────────────────────────────────────────────────
function SortableCell({
  work, index, batchMode, isSelected, onToggle, onToggleFeatured,
}: {
  work: Work; index: number; batchMode: boolean; isSelected: boolean;
  onToggle: (id: string) => void; onToggleFeatured: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: work.id, disabled: batchMode });

  const [pressing, setPressing] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : (transition ?? undefined),
    zIndex: isDragging ? 0 : undefined,
  };

  const mergedPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (batchMode) return;
      // Forward to dnd-kit sensor so it starts counting the 180ms delay
      (listeners as Record<string, (ev: unknown) => void> | undefined)?.onPointerDown?.(e);
      // Quick visual feedback before drag activates
      pressTimer.current = setTimeout(() => setPressing(true), 60);
    },
    [batchMode, listeners]
  );

  const clearPress = useCallback(() => {
    clearTimeout(pressTimer.current);
    setPressing(false);
  }, []);

  return (
    <div ref={setNodeRef} style={style}>
      <Cell
        work={work} index={index} batchMode={batchMode} isSelected={isSelected}
        pressing={pressing} isDragging={isDragging} overlay={false}
        pointerHandlers={{
          onPointerDown: mergedPointerDown,
          onPointerUp: clearPress,
          onPointerCancel: clearPress,
          onPointerLeave: clearPress,
        }}
        dndAttrs={!batchMode ? attributes : {}}
        onToggle={onToggle}
        onToggleFeatured={onToggleFeatured}
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

  // PointerSensor：統一滑鼠和觸控，長壓 180ms 啟動，5px 容差避免誤觸
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 180, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 自訂碰撞偵測：優先用游標位置（pointerWithin）→ 最近中心 fallback
  // 解決跨列拖曳「插不進去」問題：游標在哪格就插到哪格，不依賴 overlay 中心距離
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const byPointer = pointerWithin(args);
    if (byPointer.length > 0) return byPointer;
    return closestCenter(args);
  }, []);

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      if (!over || active.id === over.id) return;
      const oldIdx = works.findIndex((w) => w.id === active.id);
      const newIdx = works.findIndex((w) => w.id === over.id);
      const next = arrayMove(works, oldIdx, newIdx);
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

  // ── 批次 ──
  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(new Set(works.map((w) => w.id)));
  const exitBatch = () => { setBatchMode(false); setSelected(new Set()); };

  const handleBatchType = (type: WorkType) => {
    const ids = [...selected];
    setWorks((prev) => prev.map((w) => selected.has(w.id) ? { ...w, workType: type } : w));
    setSelected(new Set());
    startTransition(async () => { await batchSetWorkTypeAction(ids, type); });
  };

  // ── 首頁精選：直接在格子上點星星切換，不用進 Edit ──
  const handleToggleFeatured = useCallback((id: string) => {
    const next = !works.find((w) => w.id === id)?.featured;
    setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, featured: next } : w)));
    startTransition(async () => {
      try {
        const res = await toggleFeaturedAction(id, next);
        if (!res.ok) throw new Error("toggleFeaturedAction failed");
      } catch {
        // 失敗（含未登入被導去 /admin/login 拋出的 redirect）就退回原狀態，
        // 不讓畫面顯示跟資料庫不一致的星星
        setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, featured: !next } : w)));
      }
    });
  }, [works]);

  const hasSelection = selected.size > 0;
  const activeWork = activeId ? works.find((w) => w.id === activeId) ?? null : null;

  return (
    <div>
      {/* 工具列 */}
      <div className="mb-3 flex min-h-[36px] items-center gap-3">
        {batchMode ? (
          <>
            {hasSelection ? (
              <>
                <span className="text-[12px] text-text-secondary">已選 {selected.size} 件</span>
                <div className="flex items-center gap-2">
                  {(["work", "personal"] as WorkType[]).map((t) => (
                    <button key={t} onClick={() => handleBatchType(t)}
                      className="rounded-full border-[0.5px] border-warm-border bg-warm-surface px-3 py-1 text-[11px] tracking-[0.04em] text-text-primary hover:bg-warm-mid transition-colors">
                      設為「{TYPE_LABEL[t]}」
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-[11px] text-text-muted tracking-[0.04em]">點選格子以選取</span>
            )}
            <div className="ml-auto flex items-center gap-3">
              {hasSelection && (
                <button onClick={selectAll} className="text-[11px] text-text-muted hover:text-text-secondary">全選</button>
              )}
              <button onClick={exitBatch} className="text-[11px] text-text-muted hover:text-text-secondary">完成</button>
            </div>
          </>
        ) : (
          <>
            {saving || isPending ? (
              <span className="text-[11px] text-text-muted tracking-[0.04em]">儲存中…</span>
            ) : saved ? (
              <span className="text-[11px] text-text-secondary tracking-[0.04em]">排序已儲存 ✓</span>
            ) : (
              <span className="text-[11px] text-text-muted tracking-[0.04em]">長壓格子拖曳排序</span>
            )}
            <button onClick={() => setBatchMode(true)}
              className="ml-auto rounded-full border-[0.5px] border-warm-border bg-warm-surface px-3 py-1 text-[11px] tracking-[0.04em] text-text-secondary hover:bg-warm-mid transition-colors">
              批次編輯
            </button>
          </>
        )}
      </div>

      {/* IG 九宮格 */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={works.map((w) => w.id)} strategy={rectSortingStrategy}>
          {/* gap 用 bg-warm-border 呈現 IG 格線感 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[1px] bg-warm-border rounded-sm overflow-hidden">
            {works.map((w, i) => (
              <SortableCell
                key={w.id} work={w} index={i}
                batchMode={batchMode} isSelected={selected.has(w.id)}
                onToggle={toggleSelect}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        </SortableContext>

        {/* 拖曳浮動卡片 */}
        {/* snapCenterToCursor：delay 啟動後強制 overlay 貼齊游標中心
            → 解決 delay 期間移動導致 overlay 位置偏移、放開時跳到錯誤位置的問題 */}
        <DragOverlay
          modifiers={[snapCenterToCursor]}
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.2, 0, 0, 1.2)",
          }}
        >
          {activeWork ? (
            <Cell
              work={activeWork}
              index={works.findIndex((w) => w.id === activeWork.id)}
              batchMode={false} isSelected={false}
              pressing={false} isDragging={false} overlay
              pointerHandlers={{}} dndAttrs={{}} onToggle={() => {}} onToggleFeatured={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
