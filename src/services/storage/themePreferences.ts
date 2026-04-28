import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_PREFERENCES_KEY = "@theme_preferences";

export interface ThemePreferences {
  themeMode: "light" | "dark" | "system";
  isDarkMode: boolean; // Keep for backward compatibility
  accentColor: string;
}

export async function loadThemePreferences() {
  const rawValue = await AsyncStorage.getItem(THEME_PREFERENCES_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as ThemePreferences;
}

export async function saveThemePreferences(preferences: ThemePreferences) {
  await AsyncStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(preferences));
}
