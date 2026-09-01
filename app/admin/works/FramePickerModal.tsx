"use client";

import { useEffect, useRef, useState } from "react";
import { frameToBlob } from "@/lib/video-poster";

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// 像 IG Reels 編輯器一樣：完整播放影片、拖時間軸選畫格，選好按「設為封面」。
export default function FramePickerModal({
  source,
  onConfirm,
  onClose,
}: {
  /** 本機還沒上傳的檔案，或已經在線上的影片網址都可以 */
  source: File | string;
  onConfirm: (blob: Blob) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [src] = useState(() => {
    if (typeof source === "string") return source;
    const url = URL.createObjectURL(source);
    objectUrlRef.current = url;
    return url;
  });
  const [aspect, setAspect] = useState("9 / 16");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration || 0;
    setDuration(d);
    if (v.videoWidth && v.videoHeight) {
      setAspect(`${v.videoWidth} / ${v.videoHeight}`);
    }
    // 預設停在 25%，跟自動擷取邏輯一致，使用者可以再自己拖
    const t = Math.min(Math.max(d * 0.25, 0.1), Math.max(d - 0.1, 0.1));
    v.currentTime = t;
  }

  function onSeeked() {
    setTime(videoRef.current?.currentTime ?? 0);
    setReady(true);
  }

  function onScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setTime(t);
    setReady(false);
    if (videoRef.current) videoRef.current.currentTime = t;
  }

  async function confirm() {
    const v = videoRef.current;
    if (!v) return;
    setCapturing(true);
    setErr(null);
    const blob = await frameToBlob(v);
    setCapturing(false);
    if (!blob) {
      setErr("這一幀擷取失敗，拖到別的時間點再試一次");
      return;
    }
    onConfirm(blob);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-warm-bg p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-[13px] font-medium tracking-[0.02em] text-text-primary">
          選擇封面畫格
        </p>

        <div
          className="relative mx-auto overflow-hidden rounded-md bg-black"
          style={{ aspectRatio: aspect, maxHeight: "56vh" }}
        >
          <video
            ref={videoRef}
            src={src}
            crossOrigin={typeof source === "string" ? "anonymous" : undefined}
            playsInline
            muted
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain"
            onLoadedMetadata={onLoadedMetadata}
            onSeeked={onSeeked}
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-[12px] text-white/80">
                {duration ? "定位中…" : "載入影片中…"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.03}
            value={time}
            onChange={onScrub}
            disabled={!duration}
            className="h-1.5 w-full accent-[#5C4A3A] disabled:opacity-40"
          />
          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-text-muted">
            {fmt(time)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-text-muted">
          拖動下面的時間軸，找到最喜歡的畫面
        </p>

        {err && <p className="mt-2 text-[11px] text-red-600">{err}</p>}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-full px-4 text-[12px] text-text-secondary transition-colors hover:text-text-primary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!ready || capturing}
            className="h-10 rounded-full bg-text-primary px-5 text-[12px] tracking-[0.04em] text-on-dark transition-colors hover:bg-[#4A3A2C] disabled:opacity-50"
          >
            {capturing ? "擷取中…" : "設為封面"}
          </button>
        </div>
      </div>
    </div>
  );
}
