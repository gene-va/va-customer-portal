import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        va: {
          // Dark Njord-style palette — from Evotec / VA MatchMaking report.
          bg: "#0F172A",              // slate-900 page background
          surface: "#1E293B",         // slate-800 cards
          "surface-2": "#334155",     // slate-700 secondary (hover, chips, pre blocks)
          "surface-3": "#475569",     // slate-600 tertiary
          border: "#1f2a3c",          // subtle dark border (~ rgba(148,163,184,0.12) equiv)
          "border-light": "#2a3547",
          navy: "#F8FAFC",            // slate-50 — now "primary foreground" on dark bg
          "navy-light": "#CBD5E1",    // slate-300 — lighter heading text
          "navy-mid": "#94A3B8",      // slate-400
          text: "#F8FAFC",            // primary text
          "text-secondary": "#CBD5E1",
          "text-muted": "#94A3B8",
          accent: "#06B6D4",          // cyan-500 — primary accent
          "accent-hover": "#0891B2",  // cyan-600
          blue: "#3B82F6",            // blue-500 — secondary accent
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          green: "#10B981",
          "green-light": "rgba(16,185,129,0.15)",
          amber: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
        },
      },
      fontFamily: {
        heading: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
        body: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "va-hero": "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
        "va-gradient": "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
        "va-surface-glass":
          "linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(30,41,59,0.4) 100%)",
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        "va-glow": "0 0 24px rgba(6,182,212,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
