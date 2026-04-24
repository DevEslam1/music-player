import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfile } from '../redux/store/auth/authSlice';
import { AppDispatch } from '../redux/store/store';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          // If we have a token, try to fetch the profile
          // This will set isLoggedIn to true in the store if successful
          await dispatch(fetchProfile()).unwrap();
        }
      } catch (error) {
        console.log("Auto-login failed or no token found:", error);
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
};
