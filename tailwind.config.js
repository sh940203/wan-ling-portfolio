/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: "#FBF7F2",
          surface: "#F0E8DC",
          mid: "#E8DDD0",
          deep: "#DDD0C0",
          border: "#D9CCBA",
        },
        text: {
          muted: "#B0A090",
          secondary: "#9C8878",
          body: "#7A6858",
          primary: "#5C4A3A",
        },
        "on-dark": "#FBF7F2",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        display: "0.06em",
        label: "0.12em",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        full: "999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        "2xl": "64px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.3s ease both",
      },
    },
  },
  plugins: [],
};
