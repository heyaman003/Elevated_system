/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        elevator: {
          idle: "#6b7280",
          up: "#10b981",
          down: "#ef4444",
          door: "#fbbf24",
        },
      },
    },
  },
  plugins: [],
};
