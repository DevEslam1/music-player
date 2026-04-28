import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfile, setFirstLaunch } from '../redux/store/auth/authSlice';
import { AppDispatch } from '../redux/store/store';
import { CustomSplash } from './CustomSplash';
import { useState } from 'react';
import {
  setAccentColor,
  setDarkMode,
  setThemeHydrated,
  setThemeMode,
  setAdvancedBlurEnabled,
  setBlurIntensity,
  updateDerivedDarkMode,
} from '../redux/store/theme/themeSlice';
import { Appearance } from 'react-native';
import { getAccessToken } from '../services/auth/session';
import { loadThemePreferences } from '../services/storage/themePreferences';
import { showAppBanner } from './OfflineBanner';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const initAuth = async () => {
      try {
        const prefs = await loadThemePreferences();
        if (prefs && !isCancelled) {
          const savedMode = prefs.themeMode ?? (prefs.isDarkMode ? 'dark' : 'light');
          dispatch(setThemeMode(savedMode));

          if (savedMode === 'system') {
            // Derive isDarkMode from OS; never let setDarkMode override themeMode
            dispatch(updateDerivedDarkMode(Appearance.getColorScheme() === 'dark'));
          } else {
            dispatch(setDarkMode(savedMode === 'dark'));
          }

          if (prefs.accentColor) dispatch(setAccentColor(prefs.accentColor));
          if (prefs.advancedBlurEnabled !== undefined) dispatch(setAdvancedBlurEnabled(prefs.advancedBlurEnabled));
          if (prefs.blurIntensity !== undefined) dispatch(setBlurIntensity(prefs.blurIntensity));
        }
      } finally {
        if (!isCancelled) dispatch(setThemeHydrated(true));
      }

      try {
        const firstLaunch = await AsyncStorage.getItem('@is_first_launch');
        if (!isCancelled) dispatch(setFirstLaunch(firstLaunch === null));

        const token = await getAccessToken();
        if (token && !isCancelled) {
          await dispatch(fetchProfile()).unwrap();
        }
        if (!isCancelled) setAuthReady(true);
      } catch (error) {
        if (!isCancelled) {
          showAppBanner('Session expired. Please log in again.', 'warning');
          setAuthReady(true);
        }
      } finally {
        if (!isCancelled) setIsInitializing(false);
      }
    };

    initAuth();
    return () => { isCancelled = true; };
  }, [dispatch]);

  if (isInitializing) {
    return <CustomSplash />;
  }

  return <>{authReady ? children : <CustomSplash />}</>;
};
