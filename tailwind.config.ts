/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'psychedelic-purple': '#8b5cf6',
        'psychedelic-pink': '#ec4899',
        'space-dark': '#0f172a',
        'cosmic-purple': '#7e22ce',
      },
      fontFamily: {
        display: ['"Fugaz One"', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
