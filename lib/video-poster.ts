// 從影片檔擷取一張畫面當封面圖 —— 純瀏覽器端，不上傳原始影片也能做，
// 讓「上傳自己拍的影片」不用再手動截圖存檔案。

export async function captureVideoPoster(
  file: File,
  opts: { atRatio?: number; maxWidth?: number; quality?: number } = {}
): Promise<Blob | null> {
  const atRatio = opts.atRatio ?? 0.25; // 抓片長 25% 處，避開開頭黑幀/淡入
  const maxWidth = opts.maxWidth ?? 1080;
  const quality = opts.quality ?? 0.85;

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
      // 部分瀏覽器需要手動觸發載入
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

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) throw new Error("影片沒有畫面尺寸");

    const scale = Math.min(1, maxWidth / vw);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("無法建立畫布");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    return blob;
  } catch {
    // 擷取失敗（格式不支援、瀏覽器限制…）就靜靜放棄，讓使用者自己補封面
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
