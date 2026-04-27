

import { Platform } from "react-native";

const tintColorLight = "#C4401F";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#130F26",
    background: "#F7FAFF",
    tint: tintColorLight,
    icon: "#8996B8",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    inputBackground: "#FAF0EE",
    progressTrack: "#E8F5E9",
    surface: "#FFFFFF",
    skeleton: "#E2E8F0",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    inputBackground: "#1E2022",
    surface: "#1E2022",
    skeleton: "#2D3748",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
export const ACCENT_COLORS = [
  { name: "GiG Red", color: "#B34A30" },
  { name: "Ocean Blue", color: "#1F6AC4" },
  { name: "Forest Green", color: "#1F8B4D" },
  { name: "Royal Purple", color: "#7C3AED" },
  { name: "Golden Amber", color: "#D97706" },
  { name: "Midnight", color: "#334155" },
];
