/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // better glob pattern for React
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'), // ✅ for truncating text to 1/2/3 lines
  ],
};
