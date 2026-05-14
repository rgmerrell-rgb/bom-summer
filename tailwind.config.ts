import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bom: {
          navy:           '#1B3A5C',
          'navy-dark':    '#122740',
          gold:           '#D4A847',
          'gold-light':   '#EDD98A',
          cream:          '#F5F0E2',
          'cream-dark':   '#EDE6D0',
          text:           '#2C2416',
          muted:          '#6A6050',
          border:         '#DDD5BB',
          success:        '#2D6A4F',
          'success-light':'#D8F3DC',
        },
        brand: {
          50:  "#fef9ee",
          100: "#fdf0d0",
          200: "#fae19d",
          300: "#f7cd65",
          400: "#f4b637",
          500: "#f19a14",
          600: "#e07a0c",
          700: "#b95a0d",
          800: "#944612",
          900: "#783b13",
          950: "#411d07",
        },
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|text|border|ring|border-l)-bom-/,
      variants: ["hover", "focus", "disabled"],
    },
  ],
  plugins: [],
};

export default config;
