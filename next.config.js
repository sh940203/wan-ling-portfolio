/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.notion.so" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 禁止瀏覽器「猜」Content-Type，擋掉部分 XSS/下載型攻擊
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 不讓本站被別人用 <iframe> 嵌入，防點擊劫持（clickjacking）
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // 跨站時只送出來源網域，不洩漏完整網址路徑
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 關閉用不到的裝置權限；保留陀螺儀/加速度計給首頁 3D 視差用
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), gyroscope=(self), accelerometer=(self)",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
