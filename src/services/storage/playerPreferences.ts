import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYER_PREFERENCES_KEY = "@player_preferences";

export interface EqualizerSettings {
  enabled: boolean;
  bandLevels: number[];
  currentPreset: string | null;
}

export interface PlayerPreferences {
  equalizer: EqualizerSettings;
}

export async function loadPlayerPreferences(): Promise<PlayerPreferences | null> {
  try {
    const rawValue = await AsyncStorage.getItem(PLAYER_PREFERENCES_KEY);
    if (!rawValue) return null;
    return JSON.parse(rawValue) as PlayerPreferences;
  } catch (e) {
    console.warn("Failed to parse player preferences:", e);
    return null;
  }
}

export async function savePlayerPreferences(preferences: PlayerPreferences) {
  try {
    await AsyncStorage.setItem(PLAYER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.warn("Failed to save player preferences:", e);
  }
}
