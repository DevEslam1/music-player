import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DARK_MODE_KEY = "theme.darkMode";
const ACCENT_COLOR_KEY = "theme.accentColor";
const ACCENT_DEFAULT = "#B34A30";

export function useInitialTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState(ACCENT_DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedDark, savedAccent] = await Promise.all([
          AsyncStorage.getItem(DARK_MODE_KEY),
          AsyncStorage.getItem(ACCENT_COLOR_KEY),
        ]);
        if (!cancelled) {
          setIsDarkMode(savedDark === "true");
          setAccentColor(savedAccent || ACCENT_DEFAULT);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { isDarkMode, accentColor, loaded };
}
