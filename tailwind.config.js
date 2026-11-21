/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        thai: ['"Noto Sans Thai"', 'sans-serif'],
        display: ['"Mali"', 'cursive'],
        serif: ['"Playfair Display"', 'serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'bounce-soft': 'bounce 2s infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
