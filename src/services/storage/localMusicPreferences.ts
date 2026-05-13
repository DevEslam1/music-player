import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_MUSIC_PREFS_KEY = "@local_music_preferences";

export interface LocalMusicPreferences {
  /** Folder paths to exclude from scanning */
  excludedFolders: string[];
  /** Minimum file size in bytes (0 = no filter) */
  minFileSizeBytes: number;
  /** Minimum duration in seconds (0 = no filter) */
  minDurationSeconds: number;
}

export const DEFAULT_LOCAL_MUSIC_PREFS: LocalMusicPreferences = {
  excludedFolders: [],
  minFileSizeBytes: 0,
  minDurationSeconds: 0,
};

export async function loadLocalMusicPreferences(): Promise<LocalMusicPreferences> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_MUSIC_PREFS_KEY);
    if (!raw) return DEFAULT_LOCAL_MUSIC_PREFS;
    return { ...DEFAULT_LOCAL_MUSIC_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LOCAL_MUSIC_PREFS;
  }
}

export async function saveLocalMusicPreferences(prefs: LocalMusicPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_MUSIC_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn("[LocalMusicPrefs] Failed to save:", e);
  }
}
