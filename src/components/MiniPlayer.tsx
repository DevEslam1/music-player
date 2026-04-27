import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Ionicons } from "@expo/vector-icons";
import { audioPlayer } from "../services/audio/AudioPlayerService";
import { useNavigation } from "@react-navigation/native";
import { useAccentColor, useThemeColor } from "../hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

// ─── Thresholds ────────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 80;      // px to trigger next/prev
const SCRUB_SENSITIVITY = 0.5;  // how many ms per px of drag

// ─── Helpers (called on JS thread via runOnJS) ─────────────────────────────────
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

// ─── Component ─────────────────────────────────────────────────────────────────
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
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  // ── Gesture shared values ──────────────────────────────
  const translateX = useSharedValue(0);
  const isScrubbing = useSharedValue(false);
  const scrubStartPosition = useRef(0);
  const hapticFired = useSharedValue(false);

  if (!currentTrack) return null;

  const progressPercent = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

  // ── Swipe gesture (tap + short drag = next/prev) ───────
  const swipeGesture = Gesture.Pan()
    .onStart(() => {
      hapticFired.value = false;
    })
    .onUpdate((e) => {
      // Only move card if not in long-press scrub mode
      if (!isScrubbing.value) {
        translateX.value = e.translationX;
        // Fire a subtle haptic once threshold is crossed so the user feels it "snap"
        if (Math.abs(e.translationX) > SWIPE_THRESHOLD && !hapticFired.value) {
          hapticFired.value = true;
          runOnJS(triggerHapticLight)();
        }
      }
    })
    .onEnd((e) => {
      if (!isScrubbing.value) {
        if (e.translationX < -SWIPE_THRESHOLD) {
          // Swipe left → next
          translateX.value = withTiming(-300, { duration: 200 }, () => {
            translateX.value = 0;
          });
          runOnJS(triggerNext)();
        } else if (e.translationX > SWIPE_THRESHOLD) {
          // Swipe right → previous
          translateX.value = withTiming(300, { duration: 200 }, () => {
            translateX.value = 0;
          });
          runOnJS(triggerPrev)();
        } else {
          translateX.value = withSpring(0);
        }
      }
      isScrubbing.value = false;
    });

  // ── Long-press + drag = scrub track position ───────────
  const longPressScrubGesture = Gesture.Pan()
    .activateAfterLongPress(500) // 500 ms hold activates scrub mode
    .onStart(() => {
      isScrubbing.value = true;
      runOnJS(triggerHapticLight)();
      // Snapshot current position on JS thread via ref
      runOnJS((pos: number) => { scrubStartPosition.current = pos; })(positionMillis);
    })
    .onUpdate((e) => {
      if (isScrubbing.value && durationMillis > 0) {
        const deltaPx = e.translationX;
        const deltaMs = deltaPx * (durationMillis / 300) * SCRUB_SENSITIVITY;
        const targetMs = Math.max(0, Math.min(durationMillis, scrubStartPosition.current + deltaMs));
        runOnJS(triggerSeek)(targetMs);
      }
    })
    .onEnd(() => {
      isScrubbing.value = false;
    });

  // Compose: long-press scrub takes priority; swipe is the fallback
  const composedGesture = Gesture.Simultaneous(longPressScrubGesture, swipeGesture);

  // ── Animated style for card slide ─────────────────────
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 10 }]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedCardStyle}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.container,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 41, 59, 0.9)"
                  : "rgba(255, 255, 255, 0.85)",
                borderColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            ]}
            onPress={() => navigation.navigate("NowPlaying")}
          >
            {/* Progress bar */}
            <View
              style={[
                styles.progressBarBackground,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: accentColor,
                    shadowColor: accentColor,
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              />
            </View>

            <View style={styles.content}>
              <Image
                source={{ uri: currentTrack.image }}
                style={styles.image}
                contentFit="cover"
              />
              <View style={styles.info}>
                <Text
                  style={[styles.title, { color: textColor }]}
                  numberOfLines={1}
                >
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
            </View>
          </TouchableOpacity>

          {/* Swipe hint arrows — shown at edges as the card moves */}
          <SwipeHintArrows translateX={translateX} accentColor={accentColor} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

import type { SharedValue } from "react-native-reanimated";

// ─── Arrow hints that fade in as the user drags ────────────────────────────────
function SwipeHintArrows({
  translateX,
  accentColor,
}: {
  translateX: SharedValue<number>;
  accentColor: string;
}) {
  const leftStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD)),
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -translateX.value / SWIPE_THRESHOLD)),
  }));

  return (
    <>
      {/* Right-drag hint: prev */}
      <Animated.View style={[styles.hintLeft, leftStyle]}>
        <Ionicons name="play-skip-back" size={16} color={accentColor} />
      </Animated.View>
      {/* Left-drag hint: next */}
      <Animated.View style={[styles.hintRight, rightStyle]}>
        <Ionicons name="play-skip-forward" size={16} color={accentColor} />
      </Animated.View>
    </>
  );
}

export const MiniPlayer = React.memo(MiniPlayerInner);

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
  container: {
    height: 72,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  progressBarBackground: {
    height: 3,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
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
  // ── Arrow hints ─────────────────────────────
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
});
