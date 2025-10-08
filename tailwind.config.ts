import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0f12',
        panel: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
        text: '#e6eaf0',
        sub: 'rgba(230,234,240,0.75)',
        brand: {
          lime: '#c7ff57',
          cyan: '#52e1ff',
          pink: '#ff7adf',
        },
      },
      boxShadow: {
        soft: '0 6px 24px rgba(0,0,0,0.25)',
        glow: '0 0 0 1px rgba(199,255,87,0.18), 0 8px 32px rgba(199,255,87,0.08)',
      },
      borderRadius: {
        xl2: '18px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Unbounded"', '"Major Mono Display"', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
