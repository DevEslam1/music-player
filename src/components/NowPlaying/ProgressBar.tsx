import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

/**
 * Junior Developer Advice:
 * I put the progress bar here alone. 
 * Why? Because music updates every second! If this was in the main file,
 * the whole screen would re-render 60 times a minute. 
 * 
 * Here, only this small piece updates. Super fast! 🚀
 */

interface ProgressBarProps {
  positionMillis: number;
  durationMillis: number;
  onSeek: (value: number) => void;
  textColor: string;
}

export const ProgressBar = React.memo(({
  positionMillis,
  durationMillis,
  onSeek,
  textColor
}: ProgressBarProps) => {
  
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: textColor }]}>
          {formatTime(positionMillis)}
        </Text>
        <Text style={[styles.timeText, { color: textColor }]}>
          {formatTime(durationMillis)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={durationMillis || 30000}
        value={positionMillis}
        onSlidingComplete={(val) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSeek(val);
        }}
        minimumTrackTintColor="#B34A30"
        maximumTrackTintColor="#CBD5E1"
        thumbTintColor="#B34A30"
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
