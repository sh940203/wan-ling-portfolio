"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const inputCls =
  "w-full rounded-md border-[0.5px] border-warm-border bg-warm-surface px-3 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-text-muted";
const labelCls =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-text-muted";

type Kind = "image" | "video";

const CONF: Record<
  Kind,
  { accept: string; maxMB: number; clientPayload: string; folder: string }
> = {
  image: { accept: "image/*", maxMB: 12, clientPayload: "image", folder: "covers" },
  video: { accept: "video/*", maxMB: 300, clientPayload: "video", folder: "works" },
};

export default function BlobUploadField({
  name,
  label,
  kind,
  defaultValue = "",
  hint,
  buttonLabel,
}: {
  name: string;
  label: string;
  kind: Kind;
  defaultValue?: string;
  hint?: string;
  buttonLabel?: string;
}) {
  const conf = CONF[kind];
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允許再次選同一個檔案
    if (!file) return;

    const typePrefix = kind === "image" ? "image/" : "video/";
    if (!file.type.startsWith(typePrefix)) {
      setStatus("error");
      setError(kind === "image" ? "請選擇圖片檔" : "請選擇影片檔");
      return;
    }
    if (file.size > conf.maxMB * 1024 * 1024) {
      setStatus("error");
      setError(`檔案太大（上限 ${conf.maxMB}MB）`);
      return;
    }

    setStatus("uploading");
    setPct(0);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const result = await upload(`${conf.folder}/${Date.now()}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: conf.clientPayload,
        contentType: file.type,
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: (p) => setPct(Math.round(p.percentage)),
      });
      setUrl(result.url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "上傳失敗，請重試");
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>

      <div className="flex items-start gap-3">
        {/* 預覽 */}
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md border-[0.5px] border-warm-border bg-warm-surface">
          {url && kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="預覽" className="h-full w-full object-cover" />
          ) : url && kind === "video" ? (
            <video
              src={url}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-text-muted">
              {kind === "image" ? "無圖" : "無片"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* 提交用：實際存到 DB 的值 */}
          <input
            type="text"
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputCls}
            placeholder={
              kind === "image"
                ? "https://... 或 /covers/01.jpg，或按右邊上傳"
                : "https://... 影片檔網址，或按右邊上傳"
            }
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={status === "uploading"}
              className="h-9 rounded-full border-[0.5px] border-warm-border bg-warm-surface px-4 text-[12px] tracking-[0.03em] text-text-body transition-colors hover:border-text-muted disabled:opacity-50"
            >
              {status === "uploading"
                ? `上傳中… ${pct}%`
                : buttonLabel ?? "從相簿／檔案上傳"}
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
              {hint ??
                (kind === "image"
                  ? "手機可直接選相簿照片或拍照；留空時 Instagram 作品會自動抓縮圖。"
                  : `手機可直接選相簿影片；上傳後官網會用內建播放器直接播（上限 ${conf.maxMB}MB）。`)}
            </p>
          )}
        </div>
      </div>

      {/* accept 讓 iOS / Android 跳出「照片圖庫 / 拍照 / 選擇檔案」 */}
      <input
        ref={fileRef}
        type="file"
        accept={conf.accept}
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
