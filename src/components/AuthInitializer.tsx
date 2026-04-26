import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfile } from '../redux/store/auth/authSlice';
import { AppDispatch } from '../redux/store/store';
import { CustomSplash } from './CustomSplash';
import { useState } from 'react';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          
          
          await dispatch(fetchProfile()).unwrap();
        }
      } catch (error) {
        console.log("Auto-login failed or no token found:", error);
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
