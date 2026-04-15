import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        va: {
          // Light warm palette — from venturesaccelerated.com screenshot
          bg: "#e8e2d4",              // warm beige/cream page background
          surface: "#ffffff",          // white cards
          "surface-2": "#f5f0e8",     // slightly warm white (hover, secondary)
          "surface-3": "#ece7db",     // tertiary
          border: "#d4cdbf",          // warm gray border
          "border-light": "#e0dace",
          navy: "#0d1b2a",            // deep navy — primary text & icon color
          "navy-light": "#132238",
          "navy-mid": "#1a2a42",
          text: "#0d1b2a",            // dark navy text
          "text-secondary": "#3d4f63", // medium navy
          "text-muted": "#6b7a8d",    // muted blue-gray
          accent: "#c9a96e",          // gold accent for CTAs
          "accent-hover": "#b8993f",
          blue: "#1a5fb4",            // bright blue for icons/links
          green: "#1a7d45",           // muted professional green
          "green-light": "#e8f5e9",
          red: "#c0392b",
          amber: "#b8860b",
        },
      },
      fontFamily: {
        heading: [
          "'Cormorant Garamond'",
          "'Playfair Display'",
          "Georgia",
          "serif",
        ],
        body: [
          "'Source Sans 3'",
          "'Lato'",
          "'Segoe UI'",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "va-hero": "linear-gradient(135deg, #132238 0%, #1a2a42 40%, #243b5c 100%)",
        "va-gold-gradient": "linear-gradient(135deg, #c9a96e 0%, #d4b882 50%, #c9a96e 100%)",
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
