/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#eef2ff", 100:"#e0e7ff", 500:"#3030C8", 600:"#2626B6" }
      }
    },
  },
  plugins: [],
}
