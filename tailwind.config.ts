/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#1A1A2E',
        'midnight-blue': '#0F3460',
        lichen: '#E94560',
        comet: '#0dcaf0',
        'forest-green': '#03C988',
        'deep-indigo': '#2c2c54',
        spore: '#ffffff',
        moss: '#FF9A8B',
        fungal: '#F39C12',
        bark: '#202020',
        'psychedelic-purple': '#6c5ce7',
        'psychedelic-pink': '#fd79a8',
        'space-dark': '#1e272e',
        'cosmic-purple': '#a29bfe',
      },
      boxShadow: {
        glow: '0 0 12px rgba(136, 192, 87, 0.5)',
        intense: '0 0 24px rgba(79, 193, 233, 0.4)',
      },
      fontFamily: {
        display: ['"Montserrat"', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
