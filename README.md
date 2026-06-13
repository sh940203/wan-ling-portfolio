# 江婉綾 · 影像作品集

INS 暖色系個人作品集網站，影片創作者求職 + 接案用。

## Tech
- Next.js 14（App Router）+ TypeScript
- Tailwind CSS v3（色彩 token 定義於 `tailwind.config.js` / `app/globals.css`）
- Notion API 作為 CMS（`@notionhq/client`）— 未設定憑證時自動 fallback 範例資料
- Vimeo iframe 嵌入影片
- Resend 寄送聯絡表單
- 字型：Cormorant Garamond（名字/Hero）+ DM Sans（其餘），透過 `next/font` self-host

## 開始
```bash
npm install
npm run dev      # http://localhost:3000
```

## 設定內容
請看 **[SETUP.md](SETUP.md)** — 一份從頭到尾的設定清單（Notion、文字、影片、履歷、部署）。

## 結構
```
app/        頁面（Home / Work / Work[slug] / About / Contact）+ /api/contact
components/  Nav, Hero, WorkGrid, WorkCard, ContactForm, Reveal, PageTransition, ui/
lib/         notion.ts（CMS 封裝）, types.ts, site.ts（全站文字設定）, vimeo.ts
```

## 指令
| 指令 | 作用 |
|---|---|
| `npm run dev` | 本地開發 |
| `npm run build` | production build |
| `npm start` | 跑 build 結果 |
