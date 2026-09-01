// 從影片擷取畫面當封面圖 —— 純瀏覽器端，不用使用者自己截圖存檔案。
//
// captureVideoPoster()：上傳影片後自動抓一張（片長 25% 處）當保底封面。
// frameToBlob()：把「現在畫面」轉成 JPEG blob，給 FramePickerModal 用 ——
//   使用者像 IG Reels 編輯器一樣拖時間軸選畫格，選好的那一幀直接截圖。

export async function frameToBlob(
  video: HTMLVideoElement,
  opts: { maxWidth?: number; quality?: number } = {}
): Promise<Blob | null> {
  const maxWidth = opts.maxWidth ?? 1080;
  const quality = opts.quality ?? 0.85;
  try {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;
    const scale = Math.min(1, maxWidth / vw);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
  } catch {
    // 格式不支援、瀏覽器限制、或跨源畫布被污染（tainted canvas）
    return null;
  }
}

export async function captureVideoPoster(
  file: File,
  opts: { atRatio?: number; maxWidth?: number; quality?: number } = {}
): Promise<Blob | null> {
  const atRatio = opts.atRatio ?? 0.25; // 抓片長 25% 處，避開開頭黑幀/淡入

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      const onError = () => reject(new Error("無法讀取影片"));
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", onError, { once: true });
      video.load();
    });

    const duration = video.duration || 0;
    const seekTo = Math.min(
      Math.max(duration * atRatio, 0.1),
      Math.max(duration - 0.1, 0.1)
    );

    await new Promise<void>((resolve, reject) => {
      const onError = () => reject(new Error("無法定位影格"));
      video.addEventListener("seeked", () => resolve(), { once: true });
      video.addEventListener("error", onError, { once: true });
      video.currentTime = seekTo;
    });

    return await frameToBlob(video, opts);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
