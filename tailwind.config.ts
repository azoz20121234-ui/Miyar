import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        panel: "#0c172a",
        panelSoft: "#111f36",
        line: "#22324f",
        accent: "#2ec5ce",
        accentSoft: "#143f4b",
        gold: "#d5b36a",
        success: "#4bb78f",
        warning: "#e8b349",
        danger: "#ef6a6a"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 1px rgba(46, 197, 206, 0.12), 0 14px 50px rgba(0, 0, 0, 0.3)"
      },
      backgroundImage: {
        cinematic:
          "radial-gradient(circle at top left, rgba(46, 197, 206, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(213, 179, 106, 0.12), transparent 28%), linear-gradient(180deg, rgba(8, 17, 31, 0.98), rgba(4, 10, 20, 1))"
      }
    }
  },
  plugins: []
};

export default config;
