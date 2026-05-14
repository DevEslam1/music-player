import { Image } from "expo-image";
import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Ionicons } from "@expo/vector-icons";
import { audioPlayer } from "../services/audio/AudioPlayerService";
import { useNavigation } from "@react-navigation/native";
import { useAccentColor, useThemeColor, useColorScheme, useBlurSettings } from "../hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  withRepeat,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

// ─── Thresholds ────────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 80;
const SCRUB_SENSITIVITY = 0.5;

// ─── JS-thread callbacks (must be plain functions for runOnJS) ─────────────────
function triggerNext() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  audioPlayer.playNext();
}
function triggerPrev() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  audioPlayer.playPrevious();
}
function triggerSeek(millis: number) {
  audioPlayer.seek(millis);
}
function triggerHapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const GhostingImage = memo(({ image, isDarkMode }: { image: string, isDarkMode: boolean }) => (
  <Image 
    source={{ uri: image }} 
    style={[StyleSheet.absoluteFill, { opacity: isDarkMode ? 0.2 : 0.15 }]} 
    blurRadius={10}
  />
));

import { BlurView } from "expo-blur";

const MiniPlayerInner = () => {
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const { positionMillis, durationMillis } = useSelector(
    (state: RootState) => ({
      positionMillis: state.player.positionMillis,
      durationMillis: state.player.durationMillis,
    }),
    shallowEqual,
  );
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = screenWidth - 24; // left: 12, right: 12
  const minWidth = 72; // size of the CD

  const { advancedBlurEnabled, blurIntensity } = useBlurSettings();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const translateX = useSharedValue(0);
  const isScrubbing = useSharedValue(false);
  const hapticFired = useSharedValue(false);
  const scrubStartPosition = useSharedValue(0);
  const scrubPositionMs = useSharedValue(-1);

  const compactProgress = useSharedValue(0);
  const startCompactProgress = useSharedValue(0);
  const startTranslateX = useSharedValue(0);
  const volume = useSharedValue(1);
  const showVolumeIndicator = useSharedValue(0); // 0 = hidden, 1 = visible
  const gestureDirection = useSharedValue<'horizontal' | 'vertical' | null>(null);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(rotation.value + 2 * Math.PI, {
          duration: 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isPlaying]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: maxWidth - compactProgress.value * (maxWidth - minWidth),
    borderRadius: 20 + compactProgress.value * 16,
    height: 72,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => {
    let currentMs = positionMillis;
    if (isScrubbing.value && scrubPositionMs.value !== -1) {
      currentMs = scrubPositionMs.value;
    }
    const percent = durationMillis > 0 ? (currentMs / durationMillis) * 100 : 0;
    return {
      width: `${Math.max(0, Math.min(100, percent))}%` as any,
    };
  }, [positionMillis, durationMillis]);

  const animatedProgressBarStyle = useAnimatedStyle(() => ({
    opacity: 1 - compactProgress.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16 * (1 - compactProgress.value),
  }));

  const animatedImageContainerStyle = useAnimatedStyle(() => {
    const isComp = compactProgress.value;
    return {
      width: 48 + isComp * 24, // 48 to 72
      height: 48 + isComp * 24,
      borderRadius: 12 + isComp * 24, // 12 to 36
      marginRight: 12 * (1 - isComp), // 12 to 0
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      transform: [{ rotate: `${rotation.value}rad` }],
    };
  });

  const animatedTextControlsStyle = useAnimatedStyle(() => ({
    opacity: 1 - compactProgress.value,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  }));

  const animatedCdHoleStyle = useAnimatedStyle(() => ({
    opacity: compactProgress.value,
  }));

  if (!currentTrack) return null;

  const swipeGesture = Gesture.Pan()
    .onStart(() => {
      hapticFired.value = false;
      startCompactProgress.value = compactProgress.value;
      startTranslateX.value = translateX.value;
      gestureDirection.value = null;
    })
    .onUpdate((e) => {
      if (!isScrubbing.value) {
        if (gestureDirection.value === null) {
          if (Math.abs(e.translationX) > 10 || Math.abs(e.translationY) > 10) {
            gestureDirection.value = Math.abs(e.translationY) > Math.abs(e.translationX) ? 'vertical' : 'horizontal';
          }
        }

        if (gestureDirection.value === 'vertical') {
          const newCompact = Math.max(0, Math.min(1, startCompactProgress.value + e.translationY / 100));
          compactProgress.value = newCompact;
          if (startCompactProgress.value > 0.5) {
            translateX.value = startTranslateX.value * newCompact;
          } else {
            // Volume control on vertical swipe when not compact
            const delta = -e.translationY / 200;
            volume.value = Math.max(0, Math.min(1, 1 + delta));
            showVolumeIndicator.value = 1;
            runOnJS(audioPlayer.setVolume)(volume.value);
          }
        } else if (gestureDirection.value === 'horizontal') {
          if (startCompactProgress.value < 0.5) {
            translateX.value = e.translationX;
            if (Math.abs(e.translationX) > SWIPE_THRESHOLD && !hapticFired.value) {
              hapticFired.value = true;
              runOnJS(triggerHapticLight)();
            }
          } else {
            const newTranslateX = startTranslateX.value + e.translationX;
            translateX.value = Math.max(0, Math.min(maxWidth - minWidth, newTranslateX));
          }
        }
      }
    })
    .onEnd((e) => {
      if (!isScrubbing.value) {
        if (gestureDirection.value === 'vertical') {
          if (compactProgress.value > 0.5) {
            if (compactProgress.value < 1) runOnJS(triggerHapticLight)();
            compactProgress.value = withSpring(1, { damping: 20, stiffness: 200 });
          } else {
            if (compactProgress.value > 0) runOnJS(triggerHapticLight)();
            compactProgress.value = withSpring(0, { damping: 20, stiffness: 200 });
            translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
          }
          showVolumeIndicator.value = withTiming(0, { duration: 500 });
        } else if (gestureDirection.value === 'horizontal') {
          if (startCompactProgress.value < 0.5) {
            if (e.translationX < -SWIPE_THRESHOLD) {
              translateX.value = withTiming(-300, { duration: 200 }, () => {
                translateX.value = 0;
              });
              runOnJS(triggerNext)();
            } else if (e.translationX > SWIPE_THRESHOLD) {
              translateX.value = withTiming(300, { duration: 200 }, () => {
                translateX.value = 0;
              });
              runOnJS(triggerPrev)();
            } else {
              translateX.value = withSpring(0);
            }
          } else {
            const snapPoint = translateX.value > (maxWidth - minWidth) / 2 ? maxWidth - minWidth : 0;
            translateX.value = withSpring(snapPoint, { damping: 20, stiffness: 200 });
          }
        }
      }
    });

  const longPressScrubGesture = Gesture.Pan()
    .activateAfterLongPress(500)
    .onStart(() => {
      if (compactProgress.value > 0.5) return;
      isScrubbing.value = true;
      runOnJS(triggerHapticLight)();
      scrubStartPosition.value = positionMillis;
      scrubPositionMs.value = positionMillis;
    })
    .onUpdate((e) => {
      if (isScrubbing.value && durationMillis > 0) {
        const deltaMs = e.translationX * (durationMillis / 300) * SCRUB_SENSITIVITY;
        scrubPositionMs.value = Math.max(0, Math.min(durationMillis, scrubStartPosition.value + deltaMs));
      }
    })
    .onEnd(() => {
      if (isScrubbing.value) {
        runOnJS(triggerSeek)(scrubPositionMs.value);
      }
      isScrubbing.value = false;
    });

  const composedGesture = Gesture.Simultaneous(longPressScrubGesture, swipeGesture);

  const handlePress = () => {
    if (compactProgress.value > 0.5) {
      compactProgress.value = withSpring(0, { damping: 20, stiffness: 200 });
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      triggerHapticLight();
    } else {
      navigation.navigate("NowPlaying");
    }
  };

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 10 }]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[
          animatedCardStyle,
          {
            overflow: "hidden",
            borderWidth: 1,
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            backgroundColor: !advancedBlurEnabled ? (isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(255, 255, 255, 1)") : "transparent"
          }
        ]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={{ flex: 1 }}
            onPress={handlePress}
          >
            {advancedBlurEnabled && (
              <BlurView
                intensity={blurIntensity}
                tint={isDarkMode ? "dark" : "light"}
                style={[
                  StyleSheet.absoluteFill,
                  { 
                    backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.45)" : "rgba(255, 255, 255, 0.35)",
                  }
                ]}
              >
                {/* Visual Ghosting Effect: Subtle hint of the song colors */}
                {currentTrack?.image && (
                  <GhostingImage image={currentTrack.image} isDarkMode={isDarkMode} />
                )}
              </BlurView>
            )}
            
            {/* Progress bar */}
            <Animated.View
              style={[
                styles.progressBarBackground,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0,0,0,0.02)",
                },
                animatedProgressBarStyle,
              ]}
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: accentColor,
                    shadowColor: accentColor,
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                  },
                  animatedProgressStyle,
                ]}
              />
            </Animated.View>

            <Animated.View style={animatedContentStyle}>
              <Animated.View style={animatedImageContainerStyle}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: accentColor + '08' }]} />
                {!!currentTrack.image && currentTrack.image.length > 10 && (
                  <Image
                    source={{ uri: currentTrack.image }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={200}
                  />
                )}
                <Animated.View style={[
                  styles.cdHole,
                  {
                    backgroundColor: isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(255, 255, 255, 1)",
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
                  },
                  animatedCdHoleStyle
                ]} />
              </Animated.View>
              
              <Animated.View style={animatedTextControlsStyle}>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {currentTrack.name}
                  </Text>
                  <Text style={styles.artist} numberOfLines={1}>
                    {currentTrack.artist}
                  </Text>
                </View>

                <View style={styles.controls}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      audioPlayer.playPause();
                    }}
                    style={styles.playBtn}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={26}
                      color={accentColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      audioPlayer.playNext();
                    }}
                    style={styles.nextBtn}
                  >
                    <Ionicons name="play-skip-forward" size={22} color={textColor} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
          
          <VolumeIndicator volume={volume} visible={showVolumeIndicator} accentColor={accentColor} />

          {/* Swipe direction hints */}
          <SwipeHintArrows translateX={translateX} accentColor={accentColor} compactProgress={compactProgress} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// ─── Arrow hints ───────────────────────────────────────────────────────────────
function SwipeHintArrows({
  translateX,
  accentColor,
  compactProgress,
}: {
  translateX: SharedValue<number>;
  accentColor: string;
  compactProgress: SharedValue<number>;
}) {
  const leftStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD)) * (1 - compactProgress.value),
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -translateX.value / SWIPE_THRESHOLD)) * (1 - compactProgress.value),
  }));

  return (
    <>
      <Animated.View style={[styles.hintLeft, leftStyle]}>
        <Ionicons name="play-skip-back" size={16} color={accentColor} />
      </Animated.View>
      <Animated.View style={[styles.hintRight, rightStyle]}>
        <Ionicons name="play-skip-forward" size={16} color={accentColor} />
      </Animated.View>
    </>
  );
}

export const MiniPlayer = React.memo(MiniPlayerInner);

// ─── Volume Indicator ────────────────────────────────────────────────────────
function VolumeIndicator({ volume, visible, accentColor }: { volume: SharedValue<number>, visible: SharedValue<number>, accentColor: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(visible.value, { duration: 200 }),
    transform: [{ scale: withSpring(visible.value ? 1 : 0.8) }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    height: `${volume.value * 100}%` as any,
  }));

  return (
    <Animated.View style={[styles.volumeIndicator, style]}>
      <View style={styles.volumeBarBg}>
        <Animated.View style={[styles.volumeBarFill, { backgroundColor: accentColor }, barStyle]} />
      </View>
      <Ionicons 
        name={volume.value === 0 ? "volume-mute" : volume.value < 0.5 ? "volume-low" : "volume-high"} 
        size={20} 
        color="#FFF" 
        style={{ marginTop: 8 }}
      />
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  progressBarBackground: {
    height: 3,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  artist: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  nextBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  hintLeft: {
    position: "absolute",
    left: -24,
    top: "50%",
    marginTop: -12,
  },
  hintRight: {
    position: "absolute",
    right: -24,
    top: "50%",
    marginTop: -12,
  },
  cdHole: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  volumeIndicator: {
    position: 'absolute',
    right: 20,
    top: -100,
    width: 40,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  volumeBarBg: {
    width: 6,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  volumeBarFill: {
    width: '100%',
    borderRadius: 3,
  }
});
