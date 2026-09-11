import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05070a",
          900: "#0a0e14",
          850: "#0e131b",
          800: "#131a24",
          700: "#1b2430",
          600: "#28323f",
          500: "#3a4552",
        },
        ink: {
          100: "#f4f6f8",
          300: "#c3ccd6",
          400: "#8f9bab",
          500: "#6b7686",
        },
        risk: {
          low: "#2fbf83",
          moderate: "#e2b93b",
          high: "#e2823b",
          veryhigh: "#e2483b",
        },
        accent: {
          400: "#5ea8ff",
          500: "#3d8bf0",
          600: "#2a6fd4",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SFMono-Regular", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(94,168,255,0.25), 0 0 24px -4px rgba(94,168,255,0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
        "bar-grow": "bar-grow 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
