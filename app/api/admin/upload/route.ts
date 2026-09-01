import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";

// 作品封面圖上傳：走 Vercel Blob「client upload」──
// 檔案由瀏覽器直接傳到 Blob，不經過 serverless function，
// 避開 Vercel 4.5MB request body 上限（手機拍的照片常常超過）。
// 這支端點只負責：驗證是後台登入者 → 發一次性上傳 token。

export const runtime = "nodejs";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_BYTES = 12 * 1024 * 1024; // 12MB

export async function POST(request: Request): Promise<NextResponse> {
  // 先擋未登入者，再看設定，避免對匿名訪客洩漏環境狀態
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "尚未連接 Vercel Blob（缺 BLOB_READ_WRITE_TOKEN）" },
      { status: 501 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // handleUpload 內部再驗一次，雙保險
        if (!(await isAuthed())) {
          throw new Error("未登入");
        }
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      // Blob 上傳完成後 Vercel 會 server-to-server 打回這裡。
      // 本地 dev（localhost）打不到，SDK 會自動略過；正式環境不可 throw。
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上傳失敗" },
      { status: 400 }
    );
  }
}
