/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0b1120',
        sand: '#f1e9d0',
        gold: '#d7b56d',
        opal: '#b2d0c9',
        'midnight-blue': '#0c1126',
        lichen: '#88C057',
        comet: '#4FC1E9',
        'forest-green': '#1B4D3E',
        'deep-indigo': '#312e81',
        spore: '#FAFAFA',
        moss: '#A4D4AE',
        fungal: '#F2785C',
        bark: '#1A1D1B',
        'psychedelic-purple': '#8b5cf6',
        // darkened slightly for better contrast in light mode
        'psychedelic-pink': '#db2777',
        'space-dark': '#0f172a',
        'space-night': '#0c0c1a',
        'cosmic-purple': '#7e22ce',
      },
      boxShadow: {
        glow: '0 0 12px rgba(136, 192, 87, 0.5)',
        intense: '0 0 24px rgba(79, 193, 233, 0.4)',
      },
      fontFamily: {
        display: ['"Syne"', '"Righteous"', 'cursive'],
        sans: ['"Inter"', 'sans-serif'],
        herb: ['"Comfortaa"', '"Orbitron"', 'cursive'],
      },
      minHeight: {
        'screen-nav': 'calc(100dvh - 5rem)',
      },
    },
  },
  plugins: [],
}
