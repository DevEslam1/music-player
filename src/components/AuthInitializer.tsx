import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfile, setFirstLaunch, hydrateUser } from '../redux/store/auth/authSlice';
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

        // Hydrate user from storage for immediate access
        const savedUser = await AsyncStorage.getItem('current_user');
        if (savedUser && !isCancelled) {
          try {
            dispatch(hydrateUser(JSON.parse(savedUser)));
          } catch (e) {
            console.warn('Failed to parse saved user:', e);
          }
        }

        const token = await getAccessToken();
        if (token && !isCancelled) {
          // Background refresh, don't block the app if we already hydrated
          dispatch(fetchProfile());
        }
        if (!isCancelled) setAuthReady(true);
      } catch (error: any) {
        if (!isCancelled) {
          // Only show session expired if it's a definitive auth failure
          if (error.response && [400, 401].includes(error.response.status)) {
            showAppBanner('Session expired. Please log in again.', 'warning');
          }
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
