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
        background: "#0B1020",
        surface: "#111827",
        surfaceHover: "#1F2937",
        surfaceBorder: "#1E293B",
        brand: {
          violet: "#7C3AED",
          lightViolet: "#A78BFA",
          cyan: "#22D3EE",
          success: "#22C55E",
          warning: "#F59E0B",
          dark: "#0B1020",
        },
        text: {
          primary: "#F9FAFB",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(124, 58, 237, 0.5))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 5px rgba(34, 211, 238, 0.3))" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

