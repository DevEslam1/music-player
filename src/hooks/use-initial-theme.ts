import { useState, useEffect } from "react";
import { loadThemePreferences } from "../services/storage/themePreferences";
import { setDarkMode, setAccentColor, setThemeHydrated, setThemeMode, setAdvancedBlurEnabled, setBlurIntensity } from "../redux/store/theme/themeSlice";
import { useDispatch } from "react-redux";

const ACCENT_DEFAULT = "#B34A30";

export function useInitialTheme() {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [accentColor, setAccentColorLocal] = useState(ACCENT_DEFAULT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await loadThemePreferences();
        
        if (!cancelled) {
          if (prefs) {
            if ((prefs as any).themeMode) {
              dispatch(setThemeMode((prefs as any).themeMode));
              // For sync purposes, update isDarkMode if it was specific
              if ((prefs as any).themeMode !== "system") {
                dispatch(setDarkMode((prefs as any).themeMode === "dark"));
              }
            } else {
              dispatch(setDarkMode(prefs.isDarkMode));
            }
            dispatch(setAccentColor(prefs.accentColor));
            setAccentColorLocal(prefs.accentColor);

            if (prefs.advancedBlurEnabled !== undefined) {
              dispatch(setAdvancedBlurEnabled(prefs.advancedBlurEnabled));
            }
            if (prefs.blurIntensity !== undefined) {
              dispatch(setBlurIntensity(prefs.blurIntensity));
            }
          }
          dispatch(setThemeHydrated(true));
          setLoaded(true);
        }
      } catch (e) {
        console.error("Failed to hydrate theme state:", e);
        if (!cancelled) {
          dispatch(setThemeHydrated(true));
          setLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  return { accentColor, loaded };
}
