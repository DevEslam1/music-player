import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Colors } from "../constants/theme";

import { useColorScheme as useSystemColorScheme } from "react-native";

export function useColorScheme(): "light" | "dark" {
  const { themeMode, isDarkMode } = useSelector((state: RootState) => state.theme);
  const systemScheme = useSystemColorScheme();

  if (themeMode === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  
  return themeMode === "dark" ? "dark" : "light";
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
export function useAccentColor() {
  return useSelector((state: RootState) => state.theme.accentColor);
}

export function useBlurSettings() {
  const { advancedBlurEnabled, blurIntensity } = useSelector((state: RootState) => state.theme);
  return { advancedBlurEnabled, blurIntensity };
}
