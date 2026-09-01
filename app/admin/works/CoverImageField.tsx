"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const inputCls =
  "w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-text-muted";
const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-text-muted";

const MAX_MB = 12;

export default function CoverImageField({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允許再次選同一個檔案
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setError("請選擇圖片檔");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setStatus("error");
      setError(`圖片太大（上限 ${MAX_MB}MB），請先壓縮`);
      return;
    }

    setStatus("uploading");
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const result = await upload(`works/${Date.now()}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: file.type,
      });
      setUrl(result.url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "上傳失敗，請重試"
      );
    }
  }

  return (
    <div>
      <label className={labelCls}>封面圖 Cover（可留空）</label>

      <div className="flex items-start gap-3">
        {/* 預覽 */}
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md border-[0.5px] border-warm-border bg-warm-surface">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="封面預覽"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-text-muted">
              無圖
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* 提交用：實際存到 DB 的值 */}
          <input
            type="text"
            name="coverImage"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputCls}
            placeholder="https://... 或 /covers/01.jpg，或按右邊上傳"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={status === "uploading"}
              className="h-9 rounded-full border-[0.5px] border-warm-border bg-warm-surface px-4 text-[12px] tracking-[0.03em] text-text-body transition-colors hover:border-text-muted disabled:opacity-50"
            >
              {status === "uploading" ? "上傳中…" : "從相簿／檔案上傳"}
            </button>
            {url && status !== "uploading" && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setError(null);
                  setStatus("idle");
                }}
                className="h-9 px-2 text-[12px] text-text-muted transition-colors hover:text-text-primary"
              >
                移除
              </button>
            )}
          </div>

          {status === "error" && error ? (
            <p className="text-[11px] text-red-600">{error}</p>
          ) : (
            <p className="text-[11px] text-text-muted">
              手機可直接選相簿照片或拍照；留空時 Instagram 作品會自動抓縮圖。
            </p>
          )}
        </div>
      </div>

      {/* accept=image/* 讓 iOS / Android 跳出「照片圖庫 / 拍照 / 選擇檔案」 */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
