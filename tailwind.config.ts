import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      // Tokens del sistema de diseño Génesis.
      colors: {
        navy: { DEFAULT: "#002337", soft: "#0b3550" },
        orange: { DEFAULT: "#f28c38", soft: "#f6a35e" },
        surface: { DEFAULT: "#ffffff", muted: "#f3f3f3", card: "#e3e3e3" },
        ink: "#000000",
        field: "#7d8b96",
        whatsapp: { DEFAULT: "#32dd5a", hover: "#16a34a" },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "40px",
      },
      // Modos de la zona anatómica (los mismos que usa la escena 3D: src/lib/layout-mode.ts).
      //  prt: pantalla angosta en vertical → el modelo asoma por un costado, junto al titular; el texto va en un panel debajo.
      //  lsc: pantalla angosta en horizontal → modelo a un lado y texto al otro, como en escritorio.
      screens: {
        prt: { raw: "(max-width: 1023px) and (orientation: portrait)" },
        lsc: { raw: "(max-width: 1023px) and (orientation: landscape)" },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
