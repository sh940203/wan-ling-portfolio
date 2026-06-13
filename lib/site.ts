// Site-wide configuration. These are defaults; if/when an admin backend is
// wired up, these become editable settings stored in the database.

export const site = {
  // 品牌 / 名字
  name: {
    zh: "江婉綾",
    en: "Wan-Ling Chiang",
    // 導覽列 logo 與 Hero 大字使用的品牌字
    brand: "WAN-LING",
  },
  role: {
    zh: "社群短影音剪輯 · 內容創作",
    en: "Short Video Editor · Content Creator",
  },
  // 聯絡與社群
  email: "wannn2004@gmail.com",
  phone: "0970-806-692",
  socials: {
    instagram: "https://www.instagram.com/pcy_wanmei/",
    linkedin: "",
  },
  // 她目前負責剪輯的美睫店帳號
  studio: {
    name: "Riyun Eyelash 日昀美睫",
    instagram: "https://www.instagram.com/riyun.eyelash/",
  },
  resumeUrl: "/resume.pdf",

  // Hero showreel 設定
  hero: {
    // 放一支自己的影片到 public/ 後填 "/showreel.mp4"，會用 <video> 背景播放
    videoUrl: "",
    // 靜態底圖（影片載入前 / reduced-motion 時顯示）；留空則用暖色漸層
    poster: "/photo-portrait.jpg",
    subtitle: "Video Editor · Storyteller — Taipei",
  },

  // About 頁
  about: {
    photo: "/photo-portrait.jpg",
    bioZh: "嶺東科大時尚經營系應屆畢業生，曾擔任短影音小編和畢製公關，負責 IG、Threads 社群內容製作與活動宣傳。實際參與貼文企劃、文案撰寫與短影音剪輯拍攝，並具備基礎視覺排版能力，能依品牌需求執行社群內容製作並配合調整內容方向。熟悉社群運作節奏並擅長關注熱門趨勢，能快速上手社群行銷相關工作。",
    bioEn: "Recent graduate of Ling Tung University's Fashion Business & Merchandising program. Served as short-video editor and PR coordinator for her graduation project, managing IG and Threads content creation and event promotion. Experienced in post planning, copywriting, and short-form video production with solid visual layout skills. Comfortable adapting to brand needs and staying on top of trending content.",
    skills: [
      "Premiere Pro",
      "DaVinci Resolve",
      "After Effects",
      "Color Grading",
      "IG Reels",
      "Storytelling",
      "Motion Graphics",
      "社群內容策劃",
      "文案撰寫",
      "活動公關",
    ],
    // 工作 / 接案經歷
    experience: [
      {
        role: "短影音剪輯 · 畢製公關",
        org: "嶺東科大時尚經營系 畢業製作 — 元福宮",
        period: "2024 – 2025",
        desc: "擔任畢業展覽公關及短影音剪輯，負責創意腳本拍攝與後製。單支作品在 Instagram 累積 660.3 萬次瀏覽；榮獲 115 學年度第七屆畢業專題競賽論文組第三名。",
        link: "https://www.instagram.com/reel/DSZJMDjEfSa/",
      },
      {
        role: "社群影片企劃 · 剪輯",
        org: "日昀美睫 Riyun Eyelash",
        period: "2024 – 現在",
        desc: "負責店家 Instagram Reels 的企劃、拍攝與剪輯，以暖色調與輕快節奏呈現美睫服務，累積數十支社群短影音。",
        link: "https://www.instagram.com/riyun.eyelash/",
      },
    ],
  },

  contact: {
    headline: "Let's work together",
    subtitleZh: "無論是接案合作、全職機會，或只是想聊聊影像 — 歡迎來信。",
  },

  // 作品頁副標
  workIntro: "社群短影音與影像剪輯作品。點擊任一件觀看完整影片。",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
