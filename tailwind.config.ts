import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
        accent: "hsl(var(--accent) / <alpha-value>)",
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
        glow: "0 0 0 1px rgba(199,255,87,0.18), 0 8px 32px rgba(199,255,87,0.08)",
        card: "0 8px 30px rgba(0,0,0,0.3)",
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
    },
  },
  plugins: [typography],
};

export default config;
