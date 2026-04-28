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
} from '../redux/store/theme/themeSlice';
import { getAccessToken } from '../services/auth/session';
import { showAppBanner } from './OfflineBanner';

const DARK_MODE_KEY = 'theme.darkMode';
const ACCENT_COLOR_KEY = 'theme.accentColor';
const ACCENT_DEFAULT = '#B34A30';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Load saved theme prefs BEFORE the splash even renders so CustomSplash
      // gets the correct dark/light colors from the first frame.
      try {
        const [savedDark, savedAccent] = await Promise.all([
          AsyncStorage.getItem(DARK_MODE_KEY),
          AsyncStorage.getItem(ACCENT_COLOR_KEY),
        ]);
        dispatch(setDarkMode(savedDark === 'true'));
        dispatch(setAccentColor(savedAccent || ACCENT_DEFAULT));
      } finally {
        dispatch(setThemeHydrated(true));
      }

      try {
        const firstLaunch = await AsyncStorage.getItem('@is_first_launch');
        dispatch(setFirstLaunch(firstLaunch === null));

        const token = await getAccessToken();
        if (token) {
          await dispatch(fetchProfile()).unwrap();
        }
        setAuthReady(true);
      } catch (error) {
        showAppBanner('Session expired. Please log in again.', 'warning');
        setAuthReady(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (isInitializing) {
    return <CustomSplash />;
  }

  return <>{authReady ? children : <CustomSplash />}</>;
};
