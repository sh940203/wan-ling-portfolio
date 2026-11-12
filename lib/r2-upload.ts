"use client";

// 瀏覽器端上傳到 Cloudflare R2：先跟 /api/admin/upload 要預簽名網址，再直接 PUT。
// 用 XMLHttpRequest 是因為 fetch 拿不到上傳進度。

export type UploadProgress = { loaded: number; total: number };

export async function uploadToR2(
  file: Blob,
  opts: {
    kind: "image" | "video";
    contentType?: string;
    onProgress?: (p: UploadProgress) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  const contentType = opts.contentType || file.type;

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: opts.kind, contentType, size: file.size }),
    signal: opts.signal,
  });
  const data = (await res.json().catch(() => ({}))) as {
    uploadUrl?: string;
    publicUrl?: string;
    error?: string;
  };
  if (!res.ok || !data.uploadUrl || !data.publicUrl) {
    throw new Error(data.error || `取得上傳網址失敗（${res.status}）`);
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl!);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.({ loaded: e.loaded, total: e.total });
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        opts.onProgress?.({ loaded: file.size, total: file.size });
        resolve();
      } else {
        reject(new Error(`上傳失敗（R2 回應 ${xhr.status}）`));
      }
    };
    xhr.onerror = () =>
      reject(new Error("上傳失敗（網路錯誤，或 R2 的 CORS 還沒設定）"));
    xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));
    if (opts.signal) {
      if (opts.signal.aborted) return xhr.abort();
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(file);
  });

  return data.publicUrl;
}

// 給「從影片選一幀當封面」這種一次性圖片上傳用
export async function uploadCoverBlob(blob: Blob): Promise<string> {
  return uploadToR2(blob, { kind: "image", contentType: "image/jpeg" });
}
