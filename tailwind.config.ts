import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        surface: "var(--bg-surface)",
        ink: "var(--ink-primary)",
        navy: "var(--ink-navy)",
        secondary: "var(--ink-secondary)",
        muted: "var(--ink-muted)",
        accent: "var(--accent-color)",
        "badge-bg": "var(--badge-bg)",
        "badge-text": "var(--badge-text)",
        "badge-dot": "var(--badge-dot)",
        hairline: "var(--border-hairline)",
        "focus-blue": "#4a74f0",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-manrope)", "system-ui", "-apple-system", "sans-serif"],
        instrument: ["var(--font-manrope)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        container: "1200px",
        prose: "68ch",
      },
      borderRadius: {
        stage: "32px",
        card: "24px",
        inset: "18px",
        control: "14px",
        pill: "999px",
      },
      boxShadow: {
        "1": "var(--shadow-1)",
        "2": "var(--shadow-2)",
        "3": "var(--shadow-3)",
        card: "var(--shadow-2)",
        "card-hover": "var(--shadow-3)",
        pill: "0 8px 24px rgba(66, 105, 230, 0.22)",
        "pill-hover": "0 12px 28px rgba(66, 105, 230, 0.30)",
        secondary: "var(--shadow-1)",
        hub: "var(--shadow-2)",
        modal: "var(--shadow-3)",
        input: "inset 0 1px 2px rgba(15, 35, 90, 0.04)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        micro: "160ms",
        hover: "240ms",
        entrance: "600ms",
      },
      keyframes: {
        hubEntrance: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        heroRise: {
          "0%": { opacity: "0", transform: "translate3d(0, 12px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        heroFloatLeft: {
          "0%, 100%": { transform: "rotate(-8deg) translateY(0px)" },
          "50%": { transform: "rotate(-8deg) translateY(-6px)" },
        },
        heroFloatRight: {
          "0%, 100%": { transform: "rotate(8deg) translateY(0px)" },
          "50%": { transform: "rotate(8deg) translateY(-6px)" },
        },
        fadeFilter: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "hub-entrance": "hubEntrance 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "hero-rise": "heroRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-left": "heroFloatLeft 7s ease-in-out infinite",
        "float-right": "heroFloatRight 7s ease-in-out infinite",
        "fade-filter": "fadeFilter 160ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
