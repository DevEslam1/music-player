import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useSharedValue(-100);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // If isConnected is false, we are definitely offline.
      // If isInternetReachable is false, we might have WiFi but no actual internet.
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      translateY.value = offline ? 0 : -100;
    });

    return () => unsubscribe();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(translateY.value, { damping: 15, stiffness: 100 }) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <SafeAreaView>
        <View style={styles.content}>
          <Ionicons name="cloud-offline-outline" size={20} color="#FFF" />
          <Text style={styles.text}>No Internet Connection</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444', // Premium Red
    zIndex: 9999,
    paddingTop: Platform.OS === 'android' ? 10 : 0, // Safe area handling for android if not using SafeAreaView properly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
