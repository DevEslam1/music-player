import { Image } from "expo-image";
import React from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

import { useAccentColor } from '../hooks/use-theme-color';

export const CustomSplash = () => {
  const insets = useSafeAreaInsets();
  const accentColor = useAccentColor();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/app-icon.png')} 
            style={styles.logo}
            contentFit="contain"
          />
        </View>
      </View>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  }
});
