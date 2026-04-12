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
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          border: "var(--bg-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          main: "var(--accent)",
          soft: "var(--accent-glow)",
          dim: "var(--accent-dim)",
          text: "var(--bg-base)",
        },
        red: {
          DEFAULT: "#EF4444",
          dim: "#FEE2E2",
        },
        green: {
          DEFAULT: "#22C55E",
          dim: "#DCFCE7",
        },
        blue: {
          DEFAULT: "#3B82F6",
          dim: "#DBEAFE",
        }
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
        mono: ["monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
