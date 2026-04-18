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
        brand: "#00f5a0",
        brand2: "#00d9f5",
        brand3: "#7b61ff",
        dark: "#020510",
        surface: "#0a0f1e",
        card: "#0f1628",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
