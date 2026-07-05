import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF6F0",
        "ivory-deep": "#F3E7DA",
        nude: "#E6CBB8",
        "nude-deep": "#D8B79E",
        rose: "#C99A93",
        "rose-deep": "#B37F79",
        brown: "#6B4E3D",
        "brown-deep": "#4A362B",
        gold: "#AD8A52",
        "gold-light": "#CBAD79",
        graphite: "#3A332F",
        ink: "#211B17",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      backgroundImage: {
        "swatch-strip":
          "linear-gradient(90deg, #E6CBB8 0%, #C99A93 35%, #6B4E3D 70%, #AD8A52 100%)",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(58, 51, 47, 0.12)",
        card: "0 2px 12px -2px rgba(58, 51, 47, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
