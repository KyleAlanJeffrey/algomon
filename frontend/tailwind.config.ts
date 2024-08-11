import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        themelimegreen: "#CFF469",
        themesoftpink: "#F8D4D7",
        themeprettypink: "#F36EBD",
        themebabypowder: "#fdfffcff",
        themelapislazuli: "#235789ff",
        themefireenginered: "#c1292eff",
        themeschoolbusyellow: "#f1d302ff",
        themeraisinblack: "#161925ff",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
