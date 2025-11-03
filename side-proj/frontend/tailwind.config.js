/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",   // ✅ JSX/JS 포함
  ],
  darkMode: "class",                // ✅ 선택: 다크모드(class 토글)
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1D4ED8",  // 딥블루
          sky: "#38BDF8",      // 스카이블루
          accent: "#FACC15",   // 옐로우
          text: "#0F172A",     // 본문 텍스트
          subtext: "#64748B",
          bg: "#F8FAFC",
          line: "#E2E8F0",
        },
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        chip: "8px",
      },
      boxShadow: {
        subtle: "0 4px 14px rgba(0,0,0,0.06)",
      },
      spacing: {
        4.5: "18px",
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "Apple SD Gothic Neo", "sans-serif"], // ✅ 선택
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { sm:"640px", md:"768px", lg:"1024px", xl:"1280px", "2xl":"1536px" },
      },
    },
  },
  // 선택: 동적 클래스 대응
  // safelist: ["bg-brand-primary","text-brand-text","border-brand-line"],
  plugins: [],
};


