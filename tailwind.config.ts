import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080a0d",
        panel: "#11151b",
        panelSoft: "#161b23",
        line: "#232a36",
        accent: "#98aee9",
        accentSoft: "#1b2232",
        gold: "#c7b28a",
        success: "#6cb49b",
        warning: "#d5ab63",
        danger: "#da7e7b",
        mist: "#a7b1c2"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(0, 0, 0, 0.22)",
        header: "0 12px 30px rgba(0, 0, 0, 0.18)",
        glow: "0 0 0 1px rgba(152, 174, 233, 0.08), 0 10px 30px rgba(0, 0, 0, 0.16)"
      },
      backgroundImage: {
        cinematic:
          "radial-gradient(circle at top left, rgba(152, 174, 233, 0.08), transparent 26%), radial-gradient(circle at top right, rgba(199, 178, 138, 0.05), transparent 22%), linear-gradient(180deg, #080a0d 0%, #0c1015 100%)"
      }
    }
  },
  plugins: []
};

export default config;
