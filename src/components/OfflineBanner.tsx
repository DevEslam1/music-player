import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { navigationRef } from '../../App';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();
  const hasCurrentTrack = useSelector((state: RootState) => !!state.player.currentTrack);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { width: screenWidth } = useWindowDimensions();
  const translateY = useSharedValue(-200);
  const bannerLeft = useSharedValue(20);
  const bannerRight = useSharedValue(20);
  const fabTranslateY = useSharedValue(-100);

  useEffect(() => {
    let collapseTimer: NodeJS.Timeout;
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      
      if (offline) {
        translateY.value = insets.top + 10;
        setIsCollapsed(false);
        bannerLeft.value = 20;
        bannerRight.value = 20;
        
        collapseTimer = setTimeout(() => {
          setIsCollapsed(true);
          bannerRight.value = 55; // Next to search icon
          bannerLeft.value = screenWidth - 55 - 42; // Collapsed width 42
        }, 5000);
      } else {
        translateY.value = -200;
        setIsCollapsed(false);
        bannerLeft.value = 20;
        bannerRight.value = 20;
        if (collapseTimer) clearTimeout(collapseTimer);
      }
    });

    return () => {
      unsubscribe();
      if (collapseTimer) clearTimeout(collapseTimer);
    };
  }, [insets.top, screenWidth]);

  useEffect(() => {
    // Position FAB above MiniPlayer if a track is loaded
    // MiniPlayer height is 72, positioned at insets.bottom + 10
    // So its top is at insets.bottom + 82. We place FAB at +95 to have a small gap.
    const playerOffset = hasCurrentTrack ? 85 : 0;
    fabTranslateY.value = isOffline ? insets.bottom + 20 + playerOffset : -100;
  }, [insets.bottom, hasCurrentTrack, isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    top: withSpring(translateY.value, { damping: 15, stiffness: 100 }),
    left: withSpring(bannerLeft.value),
    right: withSpring(bannerRight.value),
    height: 42,
    borderRadius: isCollapsed ? 21 : 30,
    paddingHorizontal: withSpring(isCollapsed ? 0 : 16),
    justifyContent: 'center',
    alignItems: 'center',
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    bottom: withSpring(fabTranslateY.value, { damping: 15, stiffness: 100 }),
  }));

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
        <View style={styles.content}>
          <View style={[styles.iconCircle, isCollapsed && { backgroundColor: 'transparent', width: '100%' }]}>
            <Ionicons name="cloud-offline" size={isCollapsed ? 20 : 16} color="#FFF" />
          </View>
          {!isCollapsed && <Text style={styles.text}>Connection Lost • Working Offline</Text>}
        </View>
      </Animated.View>

      <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            if (navigationRef.isReady()) {
              (navigationRef as any).navigate('Downloads');
            }
          }}
        >
          <Ionicons name="download" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.95)', 
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
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10000,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
