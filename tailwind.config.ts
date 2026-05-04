/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx,js,jsx,mdx}', './components/**/*.{ts,tsx,js,jsx,mdx}', './src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-primary)',
        brand: 'oklch(52% 0.16 150 / <alpha-value>)',
        earth: {
          cream: '#f3eadc',
          paper: 'oklch(98% 0.022 85 / <alpha-value>)',
          sage: 'oklch(77% 0.07 145 / <alpha-value>)',
          moss: 'oklch(42% 0.09 145 / <alpha-value>)',
          bark: 'oklch(30% 0.055 65 / <alpha-value>)',
          clay: 'oklch(62% 0.11 55 / <alpha-value>)',
        },
        evidence: {
          high: 'oklch(52% 0.16 150 / <alpha-value>)',
          moderate: 'oklch(56% 0.13 105 / <alpha-value>)',
          limited: 'oklch(58% 0.12 70 / <alpha-value>)',
          low: 'oklch(55% 0.13 45 / <alpha-value>)',
        },
        safety: {
          high: 'oklch(52% 0.15 150 / <alpha-value>)',
          moderate: 'oklch(56% 0.12 95 / <alpha-value>)',
          caution: 'oklch(57% 0.14 55 / <alpha-value>)',
          review: 'oklch(48% 0.09 35 / <alpha-value>)',
        },
        success: 'oklch(52% 0.16 150 / <alpha-value>)',
        warning: 'oklch(58% 0.14 65 / <alpha-value>)',
        danger: 'oklch(50% 0.16 28 / <alpha-value>)',
        info: 'oklch(50% 0.11 205 / <alpha-value>)',
        glass: {
          light: 'oklch(99% 0.018 88 / 0.62)',
          standard: 'oklch(98% 0.022 85 / 0.72)',
          heavy: 'oklch(97% 0.026 82 / 0.84)',
          glow: 'oklch(96% 0.038 135 / 0.76)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'glass-in': 'glassIn 0.42s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glassIn: {
          from: { opacity: '0', transform: 'translateY(14px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      boxShadow: {
        card: '0 18px 55px oklch(30% 0.055 65 / 0.13)',
        glass: '0 24px 70px oklch(30% 0.055 65 / 0.14), inset 0 1px 0 oklch(100% 0 0 / 0.72)',
        glow: '0 0 48px oklch(52% 0.16 150 / 0.18)',
      },
      fontFamily: {
        body: ['Inter', 'Instrument Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
