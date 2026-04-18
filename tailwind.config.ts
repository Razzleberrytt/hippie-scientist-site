/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,mdx}'],
  safelist: ['animate-pulse-slow', 'shadow-glow-teal', 'shadow-glow-violet'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-teal)',
        teal: {
          DEFAULT: '#0ECFB3',
          50: '#f0fdfb',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#042e28',
        },
        violet: {
          DEFAULT: '#7B5CF5',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-teal': '0 0 24px rgba(14,207,179,0.25)',
        'glow-violet': '0 0 24px rgba(123,92,245,0.25)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['Instrument Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
