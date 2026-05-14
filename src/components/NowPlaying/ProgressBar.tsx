import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useProgress } from 'react-native-track-player';
import { useAccentColor } from '../../hooks/use-theme-color';

/**
 * Performance Tip:
 * We use useProgress() hook from react-native-track-player.
 * This hook is optimized for performance and won't trigger re-renders
 * of the parent components.
 */

interface ProgressBarProps {
  onSeek: (value: number) => void;
  textColor: string;
}

export const ProgressBar = React.memo(({
  onSeek,
  textColor
}: ProgressBarProps) => {
  const { position, duration } = useProgress(500); // Update every 500ms
  const accentColor = useAccentColor();
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Convert to millis for consistency if needed, but here we can just use seconds
  const positionMillis = position * 1000;
  const durationMillis = (duration || 30) * 1000;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: textColor }]}>
          {formatTime(position)}
        </Text>
        <Text style={[styles.timeText, { color: textColor }]}>
          {formatTime(duration)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={durationMillis}
        value={positionMillis}
        onSlidingComplete={(val) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSeek(val);
        }}
        minimumTrackTintColor={accentColor}
        maximumTrackTintColor="#CBD5E1"
        thumbTintColor={accentColor}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
