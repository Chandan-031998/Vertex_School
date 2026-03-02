/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#E0E7FF",
          500: "#4F46E5",
          600: "#4338CA"
        }
      }
    }
  },
  plugins: []
};
