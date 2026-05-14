import AsyncStorage from "@react-native-async-storage/async-storage";

const UI_PREFERENCES_KEY = "@ui_preferences";

export interface UIPreferences {
  showLyrics: boolean;
}

export async function loadUIPreferences() {
  const rawValue = await AsyncStorage.getItem(UI_PREFERENCES_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as UIPreferences;
  } catch (e) {
    console.warn("Failed to parse UI preferences:", e);
    return null;
  }
}

export async function saveUIPreferences(preferences: UIPreferences) {
  try {
    await AsyncStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.warn("Failed to save UI preferences:", e);
  }
}
