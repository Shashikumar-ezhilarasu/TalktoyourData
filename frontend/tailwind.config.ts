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
        bg: {
          base: "#0A0B0D",
          surface: "#111318",
          elevated: "#181B22",
          border: "#1E2128",
        },
        text: {
          primary: "#F0F2F5",
          secondary: "#8B90A0",
          tertiary: "#4A4F5E",
        },
        accent: {
          DEFAULT: "#F5A623",
          dim: "#3D2A0A",
          text: "#FFD080",
        },
        red: {
          DEFAULT: "#EF4444",
          dim: "#2D0A0A",
        },
        green: {
          DEFAULT: "#22C55E",
          dim: "#052E16",
        },
        blue: {
          DEFAULT: "#3B82F6",
          dim: "#0F1B3D",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
