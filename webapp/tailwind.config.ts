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
        // Nova paleta de cores do Pix/Solana
        pix: {
          primary: "#00BFA6", // Turquesa Pix
          secondary: "#9C27B0", // Roxo Solana
          gradient: {
            from: "#00FFA3", // Verde Solana
            to: "#DC1FFF", // Roxo Solana
          },
        },
        text: {
          primary: "#1F1F1F", // Preto suave
          secondary: "#6B7280", // Cinza médio
        },
        background: {
          main: "#F9FAFB", // Quase branco
          card: "#FFFFFF", // Branco puro
        },
        status: {
          error: "#FF5252", // Vermelho
          success: "#4CAF50", // Verde médio
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config; 