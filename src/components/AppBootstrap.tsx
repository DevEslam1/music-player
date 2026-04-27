import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DownloadService } from "../services/api/downloadService";
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
import { showBanner } from "../redux/store/ui/uiSlice";

interface AppBootstrapProps {
  children: React.ReactNode;
}

export function AppBootstrap({ children }: AppBootstrapProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const accentColor = useSelector((state: RootState) => state.theme.accentColor);
  const hasHydratedTheme = useSelector(
    (state: RootState) => state.theme.hasHydrated,
  );

  useEffect(() => {
    // Inject Redux dependencies to avoid circular imports in DownloadService
    DownloadService.injectRedux(store.dispatch, store.getState, {
      hydrateDownloads,
      upsertDownload,
      removeDownload,
      setDownloadProgress,
      clearDownloadProgress,
      showBanner
    });
    DownloadService.init();
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

    saveThemePreferences({ isDarkMode, accentColor }).catch((error) => {
      console.warn("Failed to persist theme preferences:", error);
    });
  }, [accentColor, hasHydratedTheme, isDarkMode]);

  return <>{children}</>;
}
