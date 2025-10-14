import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      screens: {
        "2xl": "1320px",
      },
      colors: {
        bg: {
          DEFAULT: "hsl(var(--bg) / <alpha-value>)",
        },
        fg: "hsl(var(--text) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        panel: "hsl(var(--card) / <alpha-value>)",
        text: {
          DEFAULT: "hsl(var(--text) / <alpha-value>)",
        },
        sub: "hsl(var(--mute) / <alpha-value>)",
        mute: {
          DEFAULT: "hsl(var(--mute) / <alpha-value>)",
        },
        brand: {
          50: "#d7fff4",
          100: "#b6ffe9",
          200: "#8fffe0",
          300: "#61fbd7",
          400: "#3decc9",
          500: "#23d4b1",
          600: "#18a992",
          700: "#147f73",
          800: "#0f5b55",
          900: "#0c423f",
          lime: "#c7ff57",
          cyan: "#52e1ff",
          pink: "#ff7adf",
          magenta: "#ff7adf",
        },
      },
      boxShadow: {
        soft: "0 6px 30px -12px rgba(0,0,0,0.45)",
        ring: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 8px 40px -12px rgba(0,0,0,0.5)",
        glow: "0 0 0 2px rgba(34,211,238,.15), 0 10px 30px rgba(34,211,238,.15)",
        card: "0 6px 24px rgba(0,0,0,.25)",
        halo: "0 0 120px -40px rgba(147, 51, 234, 0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Unbounded"', '"Major Mono Display"', "cursive"],
      },
      typography: ({ theme }) => ({
        invert: {
          css: {
            "--tw-prose-body": theme("colors.zinc[300]"),
            "--tw-prose-headings": theme("colors.zinc[100]"),
            "--tw-prose-links": theme("colors.sky[300]"),
            "--tw-prose-links-hover": theme("colors.sky[200]"),
            "--tw-prose-bold": theme("colors.zinc[100]"),
            "--tw-prose-quotes": theme("colors.zinc[100]"),
            "--tw-prose-code": theme("colors.pink[300]"),
            "--tw-prose-pre-code": theme("colors.zinc[100]"),
            "--tw-prose-pre-bg": theme("colors.zinc[900]"),
          },
        },
      }),
      spacing: {
        13: "3.25rem",
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        aurora: {
          "0%": { transform: "translate3d(-10%, -10%, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(10%, 5%, 0) rotate(15deg)" },
          "100%": { transform: "translate3d(-10%, -10%, 0) rotate(0deg)" },
        },
        hue: {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: 0.9 },
          "50%": { transform: "scale(1.02)", opacity: 1 },
        },
        shimmer: {
          "0%": { transform: "translateY(6px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        gradientShift: "gradientShift 18s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        aurora: "aurora 18s ease-in-out infinite",
        hue: "hue 20s linear infinite",
        breathe: "breathe 20s ease-in-out infinite",
        shimmerIn: "shimmer 700ms ease-out",
      },
      backgroundImage: {
        noisy:
          "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22 viewBox=%220 0 180 180%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22180%22 height=%22180%22 filter=%22url(%23n)%22 opacity=%220.05%22/></svg>')",
      },
    },
  },
  plugins: [typography],
};

export default config;
