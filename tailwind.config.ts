import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        svs: {
          green: "#0E9444",
          darkgreen: "#0a6e32",
          light: "#eaf7ef",
        },
      },
    },
  },
  plugins: [],
};
export default config;
