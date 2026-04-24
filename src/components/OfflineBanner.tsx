import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Starting position: off-screen above the top
  const translateY = useSharedValue(-200);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      // Position it 10px below the status bar/notch
      translateY.value = offline ? insets.top + 10 : -200;
    });

    return () => unsubscribe();
  }, [insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    top: withSpring(translateY.value, { damping: 15, stiffness: 100 }),
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-offline" size={16} color="#FFF" />
        </View>
        <Text style={styles.text}>Connection Lost • Working Offline</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.95)', // Slightly translucent Premium Red
    zIndex: 9999,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
