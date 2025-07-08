/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'psychedelic': {
          'purple': '#8B5CF6',
          'pink': '#EC4899',
          'cyan': '#06B6D4',
          'green': '#10B981',
          'orange': '#F59E0B',
        },
        'glass': {
          'light': 'rgba(255, 255, 255, 0.1)',
          'medium': 'rgba(255, 255, 255, 0.2)',
          'dark': 'rgba(0, 0, 0, 0.3)',
        }
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
    },
  },
  plugins: [],
}
