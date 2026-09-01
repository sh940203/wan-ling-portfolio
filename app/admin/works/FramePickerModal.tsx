"use client";

import { useEffect, useRef, useState } from "react";
import { frameToBlob } from "@/lib/video-poster";

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

type RVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
};

// 強制瀏覽器把「目前 currentTime 那一幀」解碼並畫出來。
// Chromium（尤其 Windows）對暫停狀態下的 seek 常常不重繪；大的遠端檔案
// 還可能 seeked 事件先到、該位置資料卻還沒下載完。靠 muted play → 抓到
// 一個 video frame 就 pause，同時解掉這兩件事。
function paintCurrentFrame(v: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        v.pause();
      } catch {
        /* ignore */
      }
      resolve();
    };
    const rvfc = v as RVFC;
    if (typeof rvfc.requestVideoFrameCallback === "function") {
      rvfc.requestVideoFrameCallback(() => finish());
    }
    timer = setTimeout(finish, 2000); // 保底
    v.play().catch(() => finish()); // 自動播放被擋也放行
  });
}

// 像 IG Reels 編輯器一樣：拖時間軸選畫格，選好按「設為封面」。
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
  const [seeking, setSeeking] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fatal, setFatal] = useState(false);

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
    setSeeking(true);
    v.currentTime = t;
  }

  async function onSeeked() {
    const v = videoRef.current;
    if (!v) return;
    await paintCurrentFrame(v);
    setTime(v.currentTime);
    setSeeking(false);
    setReady(true);
  }

  function onScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    setTime(t);
    setSeeking(true);
    setErr(null);
    if (videoRef.current) videoRef.current.currentTime = t;
  }

  function onVideoError() {
    setFatal(true);
    setErr(
      "這個瀏覽器無法解碼這支影片（可能是 4K 或特殊編碼）。請直接在下方「封面圖」欄位手動上傳一張圖。"
    );
  }

  async function confirm() {
    const v = videoRef.current;
    if (!v) return;
    setCapturing(true);
    setErr(null);
    // 確認畫面真的畫出來了再截，避免截到黑幀
    await paintCurrentFrame(v);
    const blob = await frameToBlob(v, { rejectBlank: true });
    setCapturing(false);
    if (!blob) {
      setErr("這一幀還是黑的（可能正在緩衝）。稍等一下、或把時間軸拖到別的位置再試。");
      return;
    }
    onConfirm(blob);
  }

  const showOverlay = !ready || seeking;

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
            onError={onVideoError}
          />
          {showOverlay && !fatal && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-[12px] text-white/85">
                {!duration
                  ? "載入影片中…"
                  : seeking
                  ? "定位中…（大檔案可能要幾秒）"
                  : "準備中…"}
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
            disabled={!duration || fatal}
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
            {fatal ? "關閉" : "取消"}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!ready || seeking || capturing || fatal}
            className="h-10 rounded-full bg-text-primary px-5 text-[12px] tracking-[0.04em] text-on-dark transition-colors hover:bg-[#4A3A2C] disabled:opacity-50"
          >
            {capturing ? "擷取中…" : "設為封面"}
          </button>
        </div>
      </div>
    </div>
  );
}
