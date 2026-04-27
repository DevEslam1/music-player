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
import { loadThemePreferences } from '../services/storage/themePreferences';
import { getAccessToken } from '../services/auth/session';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        try {
          const savedTheme = await loadThemePreferences();
          if (savedTheme) {
            dispatch(setDarkMode(savedTheme.isDarkMode));
            dispatch(setAccentColor(savedTheme.accentColor));
          }
        } finally {
          dispatch(setThemeHydrated(true));
        }

        // Check for first launch
        const firstLaunch = await AsyncStorage.getItem("@is_first_launch");
        if (firstLaunch === null) {
          dispatch(setFirstLaunch(true));
        } else {
          dispatch(setFirstLaunch(false));
        }

        const token = await getAccessToken();
        if (token) {
          await dispatch(fetchProfile()).unwrap();
        }
      } catch (error) {
        console.log("Auto-login failed or initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [dispatch]);


  if (isInitializing) {
    return <CustomSplash />;
  }

  return <>{children}</>;
};
