import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Colors } from "../constants/theme";

export function useColorScheme(): "light" | "dark" {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return isDarkMode ? "dark" : "light";
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
