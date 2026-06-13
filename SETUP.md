# 設定指南 — 江婉綾 作品集

照著從上到下填一次就能上線。**現在不填也能跑** — `npm install && npm run dev` 打開 http://localhost:3000 就是完整成品（已內建婉綾為「日昀美睫 Riyun Eyelash」剪輯的 16 支 Instagram Reels）。

---

## 0. 本地預覽

```bash
npm install
npm run dev      # http://localhost:3000
```

---

## 1. 作品內容（Instagram Reels）

作品已內建在 [`lib/sample-works.ts`](lib/sample-works.ts)。每支 Reel 一筆，要改很簡單：

```ts
{ code: "DXB-wV6kdaX", title: "日昀美睫 No.01", titleEn: "Riyun Eyelash 01", category: "Social", featured: true },
```

| 欄位 | 說明 |
|---|---|
| `code` | Instagram Reel 網址裡 `/reel/` 後面那串代碼。要新增作品就貼新代碼 |
| `title` / `titleEn` | 中 / 英標題（建議改成有意義的名稱，例如「接睫前後對比」）|
| `category` | `Commercial` / `Narrative` / `Social` / `Music`（目前都標 Social，可改）|
| `featured` | `true` = 顯示在首頁精選（目前前 4 支）|
| `cover` | 可選。想自訂封面就放圖到 `public/covers/` 再填 `"/covers/01.jpg"` |

> **封面圖會自動抓**：沒填 `cover` 時，系統會透過 `/api/ig-cover` 自動抓該 Reel 的 Instagram 縮圖（已快取）。抓不到時顯示暖色佔位圖。要最佳畫質可自行放 `public/covers/`。

> **作品內頁**會直接嵌入 Instagram 原始 Reel（直式播放器），不需下載影片。

---

## 2. 全站文字 → [`lib/site.ts`](lib/site.ts)

已填好的（可再調整）：

| 欄位 | 目前值 |
|---|---|
| `email` | wannn2004@gmail.com |
| `phone` | 0970-806-692 |
| `socials.instagram` | https://www.instagram.com/pcy_wanmei/ |
| `studio` | 日昀美睫 Riyun Eyelash |
| `about.bioZh` / `bioEn` | 自我介紹（**建議親自改寫成婉綾的真實經歷**）|
| `about.skills` | 技能標籤 |

待補：`socials.linkedin`（有的話填，沒有就留空會自動隱藏）。

---

## 3. About 照片 + 履歷 PDF

- **照片**：放 `public/portrait.jpg`，把 `lib/site.ts` 的 `about.photo` 改成 `"/portrait.jpg"`（目前是 placeholder 人像）。
- **履歷**：放 `public/resume.pdf`，About 頁的「Download PDF」就會生效。

---

## 4.（選用）首頁 Hero 影片

目前 Hero 是暖色漸層 + 名字（乾淨耐看）。想要電影感的全版影片版本：
把一支 showreel 放到 `public/showreel.mp4`，再設 `lib/site.ts` 的 `hero.videoUrl: "/showreel.mp4"`，文字會自動轉成淺色疊在影片上。

---

## 5.（選用）聯絡表單寄信（Resend）

`.env.local`：
```bash
RESEND_API_KEY=你的金鑰        # https://resend.com 註冊取得
CONTACT_TO_EMAIL=wannn2004@gmail.com
```
沒設金鑰時表單仍可送出（顯示成功、記在 server log，不寄信）—— 方便先預覽。

---

## 6.（選用）改用 Notion 當後台

若想用 Notion 管理作品（取代 `lib/sample-works.ts`），`.env.local` 填：
```bash
NOTION_TOKEN=...
NOTION_DATABASE_ID=...
```
Notion 資料庫欄位：`title`(Title) `title_en`(Text) `category`(Select) `year`(Number)
`video_url`(URL，貼 Instagram 或 Vimeo 連結皆可) `cover_image`(Files) `description`(Text)
`featured`(Checkbox) `order`(Number)。
建立 Integration、把資料庫分享給它、從網址取 Database ID。設定後自動改抓 Notion。

---

## 7. 部署到 Vercel（免費）

1. 專案推上 GitHub。
2. Vercel → Import Project → 選 repo。
3. Settings → Environment Variables 填 `.env.local` 內的變數（用 Notion / Resend 才需要）。
4. Deploy。

---

## 快速檢查清單

- [ ] `lib/site.ts`：bio 改成真實經歷、補 LinkedIn（可選）
- [ ] `lib/sample-works.ts`：把 16 支 Reel 標題改成有意義的名稱、調整 featured
- [ ] `public/portrait.jpg`（About 照片）+ 更新 `about.photo`
- [ ] `public/resume.pdf`（履歷）
- [ ] （選用）`public/showreel.mp4` + `hero.videoUrl`
- [ ] （選用）Resend 金鑰收聯絡信
- [ ] 推 GitHub → Vercel 部署
