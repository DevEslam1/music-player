import { Image } from "expo-image";
import React, { useEffect, memo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useInitialTheme } from "../hooks/use-initial-theme";
import { useColorScheme } from "../hooks/use-theme-color";

const { width } = Dimensions.get("window");
const WAVE_SEGMENTS = 7;
const NOTE_COUNT = 6;

// ─── Animated Note ───────────────────────────────────────────────────────────

const AnimatedNote = memo(({ np, accentColor, left }: {
  np: SharedValue<number>;
  accentColor: string;
  left: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Start near loading bar and flow upward
    const y = interpolate(np.value, [0, 1], [0, -140]);
    const opacity = interpolate(np.value, [0, 0.1, 0.75, 1], [0, 1, 1, 0]);
    const s = interpolate(np.value, [0, 0.25, 1], [0.5, 1, 0.7]);
    const drift = interpolate(np.value, [0, 1], [0, 16]);
    return {
      transform: [
        { translateY: y },
        { translateX: drift },
        { scale: s },
      ] as any,
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.note, { left, bottom: 70 }, animatedStyle]}>
      <Ionicons name="musical-notes" size={14} color={accentColor} />
    </Animated.View>
  );
});

// ─── Wave Bar ────────────────────────────────────────────────────────────────

const WaveBar = memo(({ offset, accentColor, index }: {
  offset: SharedValue<number>;
  accentColor: string;
  index: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const w = (offset.value / (WAVE_SEGMENTS * 1.2)) * 100;
    const o = 0.6 + offset.value * 0.4;
    return {
      width: `${w}%` as any,
      opacity: o,
    };
  });

  return (
    <Animated.View
      style={[
        styles.barSegment,
        { backgroundColor: accentColor, left: `${(index / WAVE_SEGMENTS) * 100}%` },
        animatedStyle,
      ]}
    />
  );
});

// ─── Splash ──────────────────────────────────────────────────────────────────

export const CustomSplash = memo(() => {
  const insets = useSafeAreaInsets();
  const { accentColor, loaded } = useInitialTheme();
  const systemTheme = useColorScheme();

  const isDark = systemTheme === "dark";
  const bg = isDark ? "#0F1114" : "#F7FAFF";
  const titlePrimary = isDark ? "#FFFFFF" : "#0F172A";
  const titleSecondary = isDark ? "#E2E8F0" : "#334155";
  const muted = isDark ? "#9CA3AF" : "#64748B";
  const gradientColors: readonly [string, string, string] = isDark
    ? ["#0F1114", "#111827", "#0A0B0E"]
    : ["#EEF4FF", "#F8FAFC", "#FFFFFF"];

  // Logo
  const logoScale = useSharedValue(0);
  const floatY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Wave shimmer
  const shimmerX = useSharedValue(0);
  const waveOffsets = Array.from({ length: WAVE_SEGMENTS }, () => useSharedValue(0));

  // Music notes
  const noteProgresses = Array.from({ length: NOTE_COUNT }, () => useSharedValue(0));

  useEffect(() => {
    if (!loaded) return;

    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    glowOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    waveOffsets.forEach((offset, i) => {
      offset.value = withDelay(
        i * 120,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
            withTiming(0, { duration: 0 }),
          ),
          -1,
          false,
        ),
      );
    });

    shimmerX.value = withDelay(
      500,
      withRepeat(
        withTiming(1.5, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );

    noteProgresses.forEach((np, i) => {
      np.value = withDelay(
        600 + i * 400,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 0 }),
          ),
          -1,
          false,
        ),
      );
    });
  }, [loaded]);

  // Logo: split transform entries to satisfy RN transform union typing
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }, { translateY: floatY.value }] as any,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(logoScale.value, [0, 1], [0.5, 1.6]) },
    ] as any,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    left: shimmerX.value,
    opacity: interpolate(shimmerX.value, [0, 0.5, 1, 1.5], [0, 0.8, 0.8, 0]),
  }));

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />

      {/* Note flow layer */}
      <View style={styles.noteLayer} pointerEvents="none">
        {noteProgresses.map((np, i) => (
          <AnimatedNote
            key={i}
            np={np}
            accentColor={accentColor}
            left={width * 0.2 + (i / (NOTE_COUNT - 1)) * (width * 0.6)}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.glowBlob, { backgroundColor: accentColor }, glowAnimatedStyle]} />

        <Animated.View entering={FadeIn.duration(350)} style={logoAnimatedStyle}>
          <View style={[styles.logoContainer, { borderColor: accentColor }]}>
            <Image
              source={require("../../assets/app-icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </Animated.View>

        <Animated.View entering={SlideInUp.delay(350).duration(600)} style={styles.textGroup}>
          <Text style={[styles.appName, { color: titlePrimary }]}>GiG</Text>
          <Text style={[styles.appName, { color: titleSecondary }]}>Player</Text>
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(650).duration(500)} style={[styles.tagline, { color: muted }]}>
          Your sound. Anywhere.
        </Animated.Text>
      </View>

      {/* Wavy progress bar */}
      <View style={[styles.progressContainer, { paddingBottom: insets.bottom + 40 }]}>
        <View style={[styles.progressTrack, { backgroundColor: muted + "20" }]}>
          {waveOffsets.map((offset, i) => (
            <WaveBar key={i} offset={offset} accentColor={accentColor} index={i} />
          ))}
          <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  noteLayer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  note: { position: "absolute" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  glowBlob: {
    position: "absolute",
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.3,
    opacity: 0.12,
  },
  logoContainer: {
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: width * 0.1,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  logo: { width: "90%", height: "90%" },
  textGroup: { flexDirection: "row", marginTop: 24, gap: 6 },
  appName: { fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  tagline: { fontSize: 14, fontWeight: "500", letterSpacing: 0.8, marginTop: 6 },
  progressContainer: { width: "100%", paddingHorizontal: width * 0.2, alignItems: "center" },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "row",
  },
  barSegment: { position: "absolute", height: "100%", borderRadius: 3, top: 0 },
  shimmer: {
    position: "absolute",
    width: 60,
    height: "100%",
    backgroundColor: "#fff",
    opacity: 0,
    borderRadius: 3,
  },
});
