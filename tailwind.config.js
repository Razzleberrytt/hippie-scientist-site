/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'monospace'],
      },
      colors: {
        'psychedelic': {
          'purple': '#8B5CF6',
          'pink': '#EC4899',
          'cyan': '#06B6D4',
          'orange': '#F97316',
          'green': '#10B981',
        },
        'glass': {
          'light': 'rgba(255, 255, 255, 0.05)',
          'medium': 'rgba(255, 255, 255, 0.10)',
          'dark': 'rgba(0, 0, 0, 0.20)',
        },
        'neon': {
          'purple': '#A855F7',
          'pink': '#EC4899',
          'blue': '#3B82F6',
          'green': '#10B981',
        }
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'gradient-shift': 'gradient-shift 20s ease infinite',
        'float': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)' },
          '66%': { transform: 'translateY(10px) rotate(240deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
            transform: 'scale(1.02)',
          },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
