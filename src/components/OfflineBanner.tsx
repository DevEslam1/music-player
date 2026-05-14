import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { navigationRef } from '../navigation/navigationUtils';
import { useSelector, useDispatch } from 'react-redux';
import { useAccentColor } from '../hooks/use-theme-color';
import { RootState } from '../redux/store/store';
import { hideBanner, BannerType } from '../redux/store/ui/uiSlice';

// ─── Color map by banner type ────────────────────────────────────────────────

const BANNER_CONFIG: Record<
  BannerType | 'offline',
  { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }
> = {
  error:   { icon: 'alert-circle',      color: '#EF4444' },
  warning: { icon: 'warning',           color: '#F59E0B' },
  success: { icon: 'checkmark-circle',  color: '#22C55E' },
  info:    { icon: 'information-circle', color: '#6366F1' },
  offline: { icon: 'cloud-offline',     color: '#B34A30' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const OfflineBanner = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const hasCurrentTrack = useSelector((state: RootState) => !!state.player.currentTrack);
  const accentColor = useAccentColor();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const banner = useSelector((state: RootState) => state.ui.banner);

  // ── offline state ──────────────────────────────
  const [isOffline, setIsOffline] = React.useState(false);

  // ── shared values ──────────────────────────────
  const translateY = useSharedValue(-200);
  const fabTranslateY = useSharedValue(-100);

  // ── auto-hide timer ref ────────────────────────
  const autoHideTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Net listener ──────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      const wasOffline = isOffline;
      setIsOffline(offline);

      if (offline && !wasOffline) {
        // Just became offline: show banner briefly
        translateY.value = insets.top + 10;
        if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
        autoHideTimer.current = setTimeout(() => {
          translateY.value = -200;
        }, 4000);
      } else if (!offline && wasOffline) {
        // Back online
        translateY.value = -200;
      }
    });

    return () => {
      unsubscribe();
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, [insets.top, isOffline]);

  // ── App-banner messages (non-offline) ─────────
  useEffect(() => {
    if (banner.visible && !isOffline) {
      translateY.value = insets.top + 10;

      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
      autoHideTimer.current = setTimeout(() => {
        dispatch(hideBanner());
      }, 3000);
    }

    if (!banner.visible && !isOffline) {
      translateY.value = -200;
    }

    return () => {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, [banner.visible, banner.message, isOffline, insets.top]);

  // ── FAB positioning ───────────────────────────
  useEffect(() => {
    const playerOffset = hasCurrentTrack ? 90 : 0;
    fabTranslateY.value = isOffline ? insets.bottom + 25 + playerOffset : -100;
  }, [insets.bottom, hasCurrentTrack, isOffline]);

  // ── Determine what to display ─────────────────
  const activeType: BannerType | 'offline' = isOffline ? 'offline' : banner.type;
  const config = BANNER_CONFIG[activeType];
  const displayMessage = isOffline
    ? 'Connection Lost • Working Offline'
    : banner.message;

  const bannerColor =
    activeType === 'info' ? `${accentColor}F2` : `${config.color}F0`;

  // ── Animated styles ───────────────────────────
  const animatedStyle = useAnimatedStyle(() => ({
    top: withSpring(translateY.value, { damping: 15, stiffness: 100 }),
    height: 42,
  }));

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    bottom: withSpring(fabTranslateY.value, { damping: 15, stiffness: 100 }),
  }));

  return (
    <>
      <Animated.View
        style={[styles.container, { backgroundColor: bannerColor }, animatedStyle]}
        pointerEvents="none"
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name={config.icon} size={16} color="#FFF" />
          </View>
          <Text style={styles.text} numberOfLines={1}>{displayMessage}</Text>
        </View>
      </Animated.View>

      {/* Offline FAB → navigate to Downloads (only if logged in) */}
      {isOffline && isLoggedIn && (
        <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: accentColor, shadowColor: accentColor }]}
            activeOpacity={0.8}
            onPress={() => {
              if (navigationRef.isReady()) {
                // Fixed: use nested navigation for Drawer items
                (navigationRef as any).navigate('Drawer', { screen: 'Downloads' });
              }
            }}
          >
            <Ionicons name="download" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
};

// ─── Helper: dispatch from outside React (services, logic files) ──────────────
import { store } from '../redux/store/store';
import { showBanner } from '../redux/store/ui/uiSlice';

export function showAppBanner(message: string, type: BannerType = 'error') {
  store.dispatch(showBanner({ message, type }));
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10000,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
