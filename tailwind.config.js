/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        surface2: "var(--bg-surface2)",
        surface3: "var(--bg-surface3)",
        surfaceHover: "var(--bg-surface-hover)",
        rowAlt: "var(--bg-row-alt)",
        line: "var(--border-line)",
        lineLight: "var(--border-line-light)",
        ink: "var(--text-ink)",
        inkSecondary: "var(--text-ink-secondary)",
        muted: "var(--text-muted)",
        mutedDark: "var(--text-muted-dark)",
        accent: "var(--accent)",
        accentLight: "var(--accent-light)",
        accentDim: "var(--accent-dim)",
        accentText: "var(--accent-text)",
        emerald: "var(--emerald)",
        emeraldDim: "var(--emerald-dim)",
        amber: "var(--amber)",
        amberDim: "var(--amber-dim)",
        rose: "#F43F5E",
        purple: "#8B5CF6",
      },
      fontFamily: {
        display: ["var(--font-display)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "var(--card-shadow)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.15)",
        accent: "0 0 20px -5px rgba(59, 130, 246, 0.25)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.85)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
