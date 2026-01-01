import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1fbf6",
          100: "#dcf7ea",
          200: "#b8edd3",
          300: "#82ddb2",
          400: "#46c789",
          500: "#22a66b",
          600: "#168555",
          700: "#126a45",
          800: "#105438",
          900: "#0d4430",
          950: "#07271b",
        },
        gold: { 500: "#c6a15b" },
      },
    },
  },
  plugins: [],
} satisfies Config;
