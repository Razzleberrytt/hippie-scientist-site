/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0C0F13',
        lichen: '#88C057',
        comet: '#4FC1E9',
        spore: '#FAFAFA',
        moss: '#A4D4AE',
        fungal: '#F2785C',
        bark: '#1A1D1B',
        'psychedelic-purple': '#8b5cf6',
        'psychedelic-pink': '#ec4899',
        'space-dark': '#0f172a',
        'cosmic-purple': '#7e22ce',
      },
      boxShadow: {
        glow: '0 0 12px rgba(136, 192, 87, 0.5)',
        intense: '0 0 24px rgba(79, 193, 233, 0.4)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', '"IBM Plex Mono"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
