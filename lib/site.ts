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
    zh: "影片剪接 · 影像創作",
    en: "Video Editor & Storyteller",
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
    // 靜態底圖（影片載入前 / reduced-motion 時顯示）；留空則用 featured 作品封面
    poster: "",
    subtitle: "Video Editor · Storyteller — Taipei",
  },

  // About 頁
  about: {
    photo: "",
    bioZh: "江婉綾，影像創作與剪接工作者，剛從時尚經營科系畢業。擅長以暖色調與細膩的節奏說故事，喜歡把日常的素材剪成有情緒、有節奏的影像。相信每一個畫面都能傳遞感受，也享受在剪接檯上把素材變成故事的過程。",
    bioEn: "Wan-Ling Chiang is a video editor and visual storyteller, recently graduated. She tells stories through warm tones and a delicate sense of rhythm, turning everyday footage into images with emotion and pace. She believes every frame can carry feeling, and loves the craft of turning footage into story at the edit.",
    skills: [
      "Premiere Pro",
      "DaVinci Resolve",
      "After Effects",
      "Color Grading",
      "Sound Design",
      "Storytelling",
      "Motion Graphics",
      "Social Cutdowns",
    ],
    // 工作 / 接案經歷
    experience: [
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
