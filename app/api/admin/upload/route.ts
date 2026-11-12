import { NextResponse } from "next/server";
import { AwsClient } from "aws4fetch";
import { randomBytes } from "crypto";
import { isAuthed } from "@/lib/auth";

// 作品封面圖 / 影片檔上傳：Cloudflare R2（S3 相容）預簽名網址。
// 檔案由瀏覽器直接 PUT 到 R2，不經過 serverless function（沒有 4.5MB 限制），
// R2 免費 10GB 儲存、流量（egress）不收費。
// 這支端點只做：驗證是後台登入者 → 檢查型別/大小 → 發一個 1 小時有效的上傳網址。

export const runtime = "nodejs";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};
const IMAGE_MAX = 12 * 1024 * 1024; //   12MB
const VIDEO_MAX = 5 * 1024 * 1024 * 1024; // 5GB（單次 PUT 上限）

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

// 前端在打開檔案選擇器時會先打這支，把 function 預熱，
// 等真正要網址的 POST 進來時就不會遇到 serverless 冷啟動。
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request): Promise<NextResponse> {
  // 先擋未登入者，再看設定，避免對匿名訪客洩漏環境狀態
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }
  const cfg = r2Config();
  if (!cfg) {
    return NextResponse.json(
      {
        error:
          "尚未設定 Cloudflare R2（缺 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_URL）",
      },
      { status: 501 }
    );
  }

  let body: { kind?: string; contentType?: string; size?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const isVideo = body.kind === "video";
  const types = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
  const contentType = String(body.contentType ?? "");
  const ext = types[contentType];
  if (!ext) {
    return NextResponse.json(
      { error: `不支援的檔案類型：${contentType || "未知"}` },
      { status: 400 }
    );
  }
  const size = Number(body.size ?? 0);
  const max = isVideo ? VIDEO_MAX : IMAGE_MAX;
  if (!Number.isFinite(size) || size <= 0 || size > max) {
    return NextResponse.json({ error: "檔案大小不符" }, { status: 400 });
  }

  const key = `${isVideo ? "works" : "covers"}/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

  try {
    const aws = new AwsClient({
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
      service: "s3",
      region: "auto",
    });
    const target = new URL(
      `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`
    );
    target.searchParams.set("X-Amz-Expires", "3600");
    // Content-Type 不納入簽名，前端 PUT 時帶的值會被存成物件的 Content-Type
    const signed = await aws.sign(new Request(target, { method: "PUT" }), {
      aws: { signQuery: true },
    });
    return NextResponse.json({
      uploadUrl: signed.url,
      publicUrl: `${cfg.publicUrl}/${key}`,
      key,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "產生上傳網址失敗" },
      { status: 500 }
    );
  }
}
