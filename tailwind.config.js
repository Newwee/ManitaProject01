/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        'aurora-wave': 'auroraWave 12s ease-in-out infinite alternate',
        'aurora-pulse': 'auroraPulse 10s ease-in-out infinite alternate',
        'star-rotate': 'starRotate 4s linear infinite',
      },
      keyframes: {
        auroraWave: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '50%': { transform: 'translate(-4%, 3%) rotate(2deg) scale(1.05)' },
          '100%': { transform: 'translate(3%, -2%) rotate(-2deg) scale(0.98)' }
        },
        auroraPulse: {
          '0%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.06)' },
          '100%': { opacity: '0.4', transform: 'scale(1)' }
        },
        starRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
