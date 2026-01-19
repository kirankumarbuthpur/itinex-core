/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // tailwind.config.js
extend: {
  colors: {
    itinex: {
      primary: "#0D9488",   // teal
      secondary: "#0284C7", // sky
      accent: "#F59E0B",    // amber
      success: "#22C55E",
      bg: "#F8FAFC",
      text: "#0F172A",
    },
    keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(18px, -14px) scale(1.08)" },
          "66%": { transform: "translate(-14px, 12px) scale(0.96)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        revealUp: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        floaty: "floaty 3.2s ease-in-out infinite",
        blob: "blob 10s ease-in-out infinite",
        shimmer: "shimmer 3.5s ease-in-out infinite",
        revealUp: "revealUp 600ms ease-out both",
      },
  },
},
  },
  plugins: [],
};

