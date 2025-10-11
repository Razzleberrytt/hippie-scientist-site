import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        panel: 'rgb(var(--card) / <alpha-value>)',
        text: 'rgb(var(--fg) / <alpha-value>)',
        sub: 'rgb(var(--muted) / <alpha-value>)',
        brand: {
          lime: '#c7ff57',
          cyan: '#52e1ff',
          pink: '#ff7adf',
          magenta: '#ff7adf',
        },
      },
      boxShadow: {
        soft: '0 6px 24px rgba(0,0,0,0.25)',
        glow: '0 0 0 1px rgba(199,255,87,0.18), 0 8px 32px rgba(199,255,87,0.08)',
        card: '0 8px 30px rgba(0,0,0,0.3)',
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
