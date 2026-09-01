"use client";

import { upload } from "@vercel/blob/client";

// 給「從影片選一幀當封面」這種一次性圖片上傳用，跟 BlobUploadField
// 內部走一樣的 client-upload 端點，共用同一組驗證/型別限制。
export async function uploadCoverBlob(blob: Blob, folder = "covers"): Promise<string> {
  const result = await upload(`${folder}/${Date.now()}-frame.jpg`, blob, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    clientPayload: "image",
    contentType: "image/jpeg",
  });
  return result.url;
}
