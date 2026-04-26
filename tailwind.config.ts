import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          peach: "#FFB592",
          peachLight: "#FFD6C4",
          olive: "#5F7B46",
          oliveDark: "#4a6136",
          oliveLight: "#7c9d5e",
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        cursive: ['var(--font-caveat)', 'cursive'],
      }
    },
  },
  plugins: [],
};
export default config;
