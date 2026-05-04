/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx,js,jsx,mdx}', './components/**/*.{ts,tsx,js,jsx,mdx}', './src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-primary)',
        brand: 'oklch(72% 0.19 145)',
        evidence: {
          high: 'oklch(68% 0.22 145)',
          moderate: 'oklch(65% 0.18 100)',
          limited: 'oklch(68% 0.13 65)',
          low: 'oklch(62% 0.16 40)',
        },
        safety: {
          high: 'oklch(70% 0.18 145)',
          moderate: 'oklch(66% 0.15 85)',
          caution: 'oklch(62% 0.18 45)',
          review: 'oklch(58% 0.12 25)',
        },
        success: 'oklch(68% 0.22 145)',
        warning: 'oklch(65% 0.18 55)',
        danger: 'oklch(58% 0.18 25)',
        info: 'oklch(65% 0.12 200)',
        glass: {
          light: 'oklch(22% 0.03 220 / 0.85)',
          standard: 'oklch(18% 0.02 220 / 0.78)',
          heavy: 'oklch(15% 0.02 220 / 0.65)',
          glow: 'oklch(18% 0.02 220 / 0.78)',
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
        card: '0 22px 70px oklch(0% 0 0 / 0.22)',
        glass: '0 24px 80px oklch(0% 0 0 / 0.28), inset 0 1px 0 oklch(100% 0 0 / 0.08)',
        glow: '0 0 56px oklch(72% 0.19 145 / 0.18)',
      },
      fontFamily: {
        body: ['Inter', 'Instrument Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
