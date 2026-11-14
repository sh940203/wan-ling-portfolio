"use client";

// 瀏覽器端影片壓縮（WebCodecs，透過 mediabunny）：不經過伺服器，檔案不會離開使用者的裝置。
// 4K 手機影片通常能從 200MB+ 縮到 20～60MB，畫質在手機／網頁上幾乎看不出差別。
// mediabunny 體積不小，一律動態載入，只有真的需要壓縮時才下載。

export type CompressProgress = { ratio: number; processedSec: number };

export class CompressUnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompressUnsupportedError";
  }
}

/** 長邊上限；1920 = 1080p，網頁播放完全夠用。 */
const MAX_LONG_SIDE = 1920;

export async function compressVideo(
  file: File,
  opts: { onProgress?: (p: CompressProgress) => void; signal?: AbortSignal } = {}
): Promise<File> {
  if (typeof VideoEncoder === "undefined" || typeof VideoDecoder === "undefined") {
    throw new CompressUnsupportedError("這個瀏覽器不支援影片壓縮（建議用最新版 Safari 或 Chrome）");
  }

  const mb = await import("mediabunny");

  if (!(await mb.canEncodeVideo("avc"))) {
    throw new CompressUnsupportedError("這個裝置無法壓縮影片，請選擇「原檔上傳」");
  }

  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  const output = new mb.Output({ format: new mb.Mp4OutputFormat(), target: new mb.BufferTarget() });

  const conversion = await mb.Conversion.init({
    input,
    output,
    video: async (track) => {
      const w = await track.getDisplayWidth();
      const h = await track.getDisplayHeight();
      // 只縮小、不放大；長邊超過 1080p 才縮，並保持比例
      if (Math.max(w, h) <= MAX_LONG_SIDE) {
        return { codec: "avc", quality: mb.QUALITY_MEDIUM };
      }
      return w >= h
        ? { codec: "avc", width: MAX_LONG_SIDE, quality: mb.QUALITY_MEDIUM }
        : { codec: "avc", height: MAX_LONG_SIDE, quality: mb.QUALITY_MEDIUM };
    },
    audio: { codec: "aac" },
  });

  if (!conversion.isValid) {
    throw new CompressUnsupportedError("這支影片的格式無法在瀏覽器壓縮，請選擇「原檔上傳」");
  }

  conversion.onProgress = (ratio, processedSec) => opts.onProgress?.({ ratio, processedSec });
  const onAbort = () => void conversion.cancel();
  opts.signal?.addEventListener("abort", onAbort, { once: true });

  try {
    await conversion.execute();
  } catch (err) {
    if (opts.signal?.aborted) throw new DOMException("aborted", "AbortError");
    throw err;
  } finally {
    opts.signal?.removeEventListener("abort", onAbort);
  }

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("壓縮失敗：沒有產生輸出檔案");
  const name = file.name.replace(/\.[^.]+$/, "") + ".mp4";
  return new File([buffer], name, { type: "video/mp4" });
}
