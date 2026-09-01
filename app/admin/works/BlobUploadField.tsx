"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { captureVideoPoster } from "@/lib/video-poster";
import { uploadCoverBlob } from "@/lib/blob-upload";
import FramePickerModal from "./FramePickerModal";

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
  // 影片實務上不設限，只擋明顯異常的超大檔；multipart 會分塊處理
  video: { accept: "video/*", maxMB: 5120, clientPayload: "video", folder: "works" },
};

const UPLOAD_URL = "/api/admin/upload";
const MB = 1024 * 1024;
const fmtMB = (b: number) => (b / MB).toFixed(b < 10 * MB ? 1 : 0);

export default function BlobUploadField({
  name,
  label,
  kind,
  defaultValue = "",
  value,
  onValueChange,
  hint,
  buttonLabel,
  onPosterReady,
}: {
  name: string;
  label: string;
  kind: Kind;
  /** 不傳就是自己管理狀態（uncontrolled）；傳了就由外層（WorkForm）掌控目前值 */
  defaultValue?: string;
  value?: string;
  onValueChange?: (url: string) => void;
  hint?: string;
  buttonLabel?: string;
  /** kind="video" 專用：選好封面畫格後回傳網址 */
  onPosterReady?: (url: string) => void;
}) {
  const conf = CONF[kind];
  const controlled = value !== undefined;
  const [innerUrl, setInnerUrl] = useState(defaultValue);
  const url = controlled ? value! : innerUrl;
  const setUrl = (v: string) => {
    if (controlled) onValueChange?.(v);
    else setInnerUrl(v);
  };

  const [status, setStatus] = useState<
    "idle" | "preparing" | "uploading" | "error"
  >("idle");
  const [prog, setProg] = useState({ loaded: 0, total: 0, mbps: 0, eta: 0 });
  const [error, setError] = useState<string | null>(null);
  const [posterState, setPosterState] = useState<
    "idle" | "capturing" | "done" | "failed"
  >("idle");
  // 選好的影片先停在這裡等使用者在畫格選取器裡挑封面，確認後才真正開始上傳
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const tick = useRef({ t0: 0, lastAt: 0 });

  // 打開檔案選擇器的同時預熱 token 端點：使用者在選片 / iOS 準備檔案那幾秒，
  // 這支 serverless function 已經被叫醒，等真正要 token 時就不用等冷啟動。
  function warm() {
    fetch(UPLOAD_URL, { method: "GET", cache: "no-store" }).catch(() => {});
  }

  function openPicker() {
    warm();
    fileRef.current?.click();
  }

  // 保底：使用者在畫格選取器按「取消」時，改用自動擷取（片長 25% 處）當封面，
  // 跟主上傳平行跑，失敗就默默放棄（使用者仍可自行貼網址/上傳封面）。
  function autoCapturePoster(file: File) {
    if (!onPosterReady) return;
    setPosterState("capturing");
    captureVideoPoster(file)
      .then(async (blob) => {
        if (!blob) {
          setPosterState("failed");
          return;
        }
        const coverUrl = await uploadCoverBlob(blob);
        onPosterReady(coverUrl);
        setPosterState("done");
      })
      .catch(() => setPosterState("failed"));
  }

  // 使用者在畫格選取器裡挑好的那一幀
  function useHandPickedPoster(blob: Blob) {
    if (!onPosterReady) return;
    setPosterState("capturing");
    uploadCoverBlob(blob)
      .then((coverUrl) => {
        onPosterReady(coverUrl);
        setPosterState("done");
      })
      .catch(() => setPosterState("failed"));
  }

  async function startUpload(file: File) {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    tick.current = { t0: Date.now(), lastAt: 0 };
    setStatus("preparing");
    setProg({ loaded: 0, total: file.size, mbps: 0, eta: 0 });
    setError(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const result = await upload(`${conf.folder}/${Date.now()}.${ext}`, file, {
        access: "public",
        handleUploadUrl: UPLOAD_URL,
        clientPayload: conf.clientPayload,
        contentType: file.type,
        // 大檔用 multipart：分塊並行上傳，也能中途重試
        multipart: file.size > 15 * MB,
        abortSignal: ctrl.signal,
        onUploadProgress: (p) => {
          const now = Date.now();
          // 節流：最多每 250ms 更新一次畫面
          if (now - tick.current.lastAt < 250 && p.loaded < p.total) return;
          tick.current.lastAt = now;
          const secs = (now - tick.current.t0) / 1000;
          const mbps = secs > 0 ? p.loaded / MB / secs : 0;
          const eta = mbps > 0 ? (p.total - p.loaded) / MB / mbps : 0;
          setStatus("uploading");
          setProg({ loaded: p.loaded, total: p.total, mbps, eta });
        },
      });
      setUrl(result.url);
      setStatus("idle");
    } catch (err) {
      if (ctrl.signal.aborted) {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setError(err instanceof Error ? err.message : "上傳失敗，請重試");
    } finally {
      abortRef.current = null;
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允許再次選同一個檔案
    if (!file) return;

    const typePrefix = kind === "image" ? "image/" : "video/";
    if (!file.type.startsWith(typePrefix)) {
      setStatus("error");
      setError(kind === "image" ? "請選擇圖片檔" : "請選擇影片檔");
      return;
    }
    if (file.size > conf.maxMB * MB) {
      setStatus("error");
      setError(`檔案太大（上限 ${conf.maxMB >= 1024 ? conf.maxMB / 1024 + "GB" : conf.maxMB + "MB"}）`);
      return;
    }

    setError(null);
    setPosterState("idle");

    // 影片：先讓使用者像 IG Reels 編輯器一樣挑封面畫格，挑好才真正開始上傳
    if (kind === "video" && onPosterReady) {
      setPendingFile(file);
      return;
    }
    startUpload(file);
  }

  const busy = status === "preparing" || status === "uploading";
  const pctNum =
    prog.total > 0 ? Math.min(100, Math.round((prog.loaded / prog.total) * 100)) : 0;

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
              onClick={openPicker}
              disabled={busy}
              className="h-9 rounded-full border-[0.5px] border-warm-border bg-warm-surface px-4 text-[12px] tracking-[0.03em] text-text-body transition-colors hover:border-text-muted disabled:opacity-50"
            >
              {status === "preparing"
                ? "準備中…"
                : status === "uploading"
                ? `上傳中 ${pctNum}%`
                : buttonLabel ?? "從相簿／檔案上傳"}
            </button>

            {busy && (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="h-9 px-2 text-[12px] text-text-muted transition-colors hover:text-text-primary"
              >
                取消
              </button>
            )}

            {url && !busy && (
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

          {/* 進度列 */}
          {busy && (
            <div className="space-y-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-warm-mid">
                <div
                  className="h-full rounded-full bg-text-primary transition-[width] duration-200"
                  style={{ width: `${status === "preparing" ? 3 : pctNum}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted">
                {status === "preparing"
                  ? "連線中…（檔案不會經過伺服器，直接傳到儲存空間）"
                  : `已傳 ${fmtMB(prog.loaded)} / ${fmtMB(prog.total)} MB` +
                    (prog.mbps > 0 ? ` · ${prog.mbps.toFixed(1)} MB/s` : "") +
                    (prog.eta > 1 ? ` · 剩約 ${Math.ceil(prog.eta)} 秒` : "")}
              </p>
            </div>
          )}

          {kind === "video" && posterState !== "idle" && (
            <p className="text-[11px] text-text-muted">
              {posterState === "capturing" && "封面：上傳擷取的畫格中…"}
              {posterState === "done" && "封面：已套用你選的畫格 ✓（下方可重新上傳覆蓋）"}
              {posterState === "failed" && "封面：擷取失敗，請手動上傳封面"}
            </p>
          )}

          {status === "error" && error ? (
            <p className="text-[11px] text-red-600">{error}</p>
          ) : !busy ? (
            <p className="text-[11px] text-text-muted">
              {hint ??
                (kind === "image"
                  ? "手機可直接選相簿照片或拍照；留空時 Instagram 作品會自動抓縮圖。"
                  : "手機建議先把影片存到「檔案」App 再從那裡選（照片 App 會先花時間轉檔）。")}
            </p>
          ) : null}
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

      {pendingFile && (
        <FramePickerModal
          source={pendingFile}
          onConfirm={(blob) => {
            const file = pendingFile;
            setPendingFile(null);
            useHandPickedPoster(blob);
            startUpload(file);
          }}
          onClose={() => {
            const file = pendingFile;
            setPendingFile(null);
            autoCapturePoster(file);
            startUpload(file);
          }}
        />
      )}
    </div>
  );
}
