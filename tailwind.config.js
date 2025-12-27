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
  },
},
  },
  plugins: [],
};
