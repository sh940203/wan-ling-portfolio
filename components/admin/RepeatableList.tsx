"use client";

import { useState } from "react";
import BlobUploadField from "@/app/admin/works/BlobUploadField";

const inputCls =
  "w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-3 py-2 text-[13px] text-text-primary outline-none transition-colors focus:border-text-muted";
const miniLabel = "mb-1 block text-[10px] uppercase tracking-[0.08em] text-text-muted";

export type RLField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  placeholder?: string;
  /** text/textarea 佔整行；預設 image 也整行，短欄位可設 half */
  span?: "full" | "half";
};

type Row = Record<string, string>;

// 結構化的可增減清單編輯器：使用者看到的是欄位，實際上寫成一個 hidden JSON 欄位交給表單。
export default function RepeatableList({
  name,
  fields,
  initial,
  addLabel = "新增一筆",
  emptyHint,
}: {
  /** 表單裡 hidden input 的 name，值為 JSON 字串 */
  name: string;
  fields: RLField[];
  initial: unknown[];
  addLabel?: string;
  emptyHint?: string;
}) {
  const blank = (): Row => Object.fromEntries(fields.map((f) => [f.key, ""]));

  const [rows, setRows] = useState<Row[]>(() => {
    const arr = Array.isArray(initial) ? initial : [];
    return arr.map((item) => {
      const src = (item ?? {}) as Record<string, unknown>;
      const r = blank();
      for (const f of fields) r[f.key] = src[f.key] == null ? "" : String(src[f.key]);
      return r;
    });
  });

  const update = (i: number, key: string, val: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  const add = () => setRows((prev) => [...prev, blank()]);
  const remove = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />

      {rows.length === 0 && emptyHint && (
        <p className="text-[12px] text-text-muted">{emptyHint}</p>
      )}

      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-md border-[0.5px] border-warm-border bg-warm-bg p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] tracking-[0.08em] text-text-muted">
              第 {i + 1} 筆
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="h-7 w-7 rounded text-[13px] text-text-muted transition-colors hover:bg-warm-mid hover:text-text-primary disabled:opacity-30"
                aria-label="上移"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                className="h-7 w-7 rounded text-[13px] text-text-muted transition-colors hover:bg-warm-mid hover:text-text-primary disabled:opacity-30"
                aria-label="下移"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="h-7 rounded px-2 text-[11px] text-text-muted transition-colors hover:bg-[#F4E3DC] hover:text-[#8A4A36]"
              >
                刪除
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.key}
                className={f.span === "half" ? "" : "sm:col-span-2"}
              >
                <label className={miniLabel}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    value={row[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className={`${inputCls} resize-y`}
                  />
                ) : f.type === "image" ? (
                  <BlobUploadField
                    name={`__rl_${name}_${i}_${f.key}`}
                    label=""
                    kind="image"
                    value={row[f.key]}
                    onValueChange={(v) => update(i, f.key, v)}
                  />
                ) : (
                  <input
                    value={row[f.key]}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-full border-[0.5px] border-warm-border bg-warm-surface px-4 py-1.5 text-[12px] tracking-[0.03em] text-text-secondary transition-colors hover:border-text-muted"
      >
        + {addLabel}
      </button>
    </div>
  );
}
