import React, { useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { DownloadService } from "../services/api/downloadService";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { registerUnauthorizedHandler } from "../services/auth/session";
import { store, AppDispatch, RootState } from "../redux/store/store";
import { logoutCompleted } from "../redux/store/auth/authSlice";
import { saveThemePreferences } from "../services/storage/themePreferences";
import { 
  hydrateDownloads, 
  upsertDownload, 
  removeDownload, 
  setDownloadProgress, 
  clearDownloadProgress 
} from "../redux/store/downloads/downloadsSlice";
import { 
  updateDerivedDarkMode,
} from "../redux/store/theme/themeSlice";
import { showBanner } from "../redux/store/ui/uiSlice";
import { audioPlayer } from "../services/audio/AudioPlayerService";
import { setIsPlaying, setProgress, setCurrentTrack, setPlaybackError } from "../redux/store/player/playerSlice";
import { updateTracks } from "../redux/store/localLibrary/localLibrarySlice";

interface AppBootstrapProps {
  children: React.ReactNode;
}

export function AppBootstrap({ children }: AppBootstrapProps) {
  const dispatch = useDispatch<AppDispatch>();
  const systemColorScheme = useSystemColorScheme();
  const theme = useSelector((state: RootState) => state.theme, shallowEqual);
  const { isDarkMode, accentColor, themeMode, advancedBlurEnabled, blurIntensity, hasHydrated: hasHydratedTheme } = theme;

  useEffect(() => {
    if (themeMode !== "system" || !hasHydratedTheme) {
      return;
    }

    const isSystemDark = systemColorScheme === "dark";
    if (isDarkMode !== isSystemDark) {
      dispatch(updateDerivedDarkMode(isSystemDark));
    }
  }, [dispatch, hasHydratedTheme, isDarkMode, systemColorScheme, themeMode]);

  useEffect(() => {
    DownloadService.injectRedux(store.dispatch, store.getState, {
      hydrateDownloads,
      upsertDownload,
      removeDownload,
      setDownloadProgress,
      clearDownloadProgress,
      showBanner
    });
    DownloadService.init();

    audioPlayer.injectRedux(store.dispatch, store.getState, {
      setIsPlaying,
      setProgress,
      setCurrentTrack,
      setPlaybackError,
      updateTracks
    });
  }, []);

  useEffect(() => {
    return registerUnauthorizedHandler(() => {
      dispatch(logoutCompleted());
    });
  }, [dispatch]);

  useEffect(() => {
    if (!hasHydratedTheme) {
      return;
    }

    saveThemePreferences({ 
      themeMode,
      isDarkMode, 
      accentColor,
      advancedBlurEnabled,
      blurIntensity
    }).catch((error) => {
      console.warn("Failed to persist theme preferences:", error);
    });
  }, [accentColor, hasHydratedTheme, isDarkMode, themeMode, advancedBlurEnabled, blurIntensity]);

  return <>{children}</>;
}
