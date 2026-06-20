import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/lib/site";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// 收件信箱：優先用環境變數，否則退回預設 site.email
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || site.email;
// 寄件地址：未驗證網域前可用 Resend 的測試地址
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  // 速率限制：同一 IP 每 10 分鐘最多 5 封，避免被灌爆耗盡寄信額度
  const { success, reset } = await rateLimit(`contact:${ipFromRequest(req)}`, {
    max: 5,
    windowSec: 600,
  });
  if (!success) {
    const retry = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "請求過於頻繁，請稍後再試 / Too many requests." },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "請填寫所有欄位 / All fields are required." },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Email 格式不正確 / Invalid email." },
      { status: 400 }
    );
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { error: "訊息太長了 / Message too long." },
      { status: 400 }
    );
  }

  // 未設定 Resend 金鑰：記錄到 server log，仍回傳成功讓表單可用於預覽
  if (!RESEND_API_KEY) {
    console.warn(
      "[contact] RESEND_API_KEY 未設定，僅記錄訊息：",
      { name, email, message }
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `Portfolio <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      reply_to: email,
      subject: `網站來信：${name}`,
      text: `姓名 Name: ${name}\nEmail: ${email}\n\n訊息 Message:\n${message}`,
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { error: "寄送失敗，請稍後再試。" },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] 例外:", err);
    return NextResponse.json(
      { error: "伺服器錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
