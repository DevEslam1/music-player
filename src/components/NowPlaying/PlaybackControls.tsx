import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

/**
 * Junior Dev Comment:
 * Here are the cool play/pause buttons! 
 * I also added haptic feedback (vibrations) to make it feel premium.
 */

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'queue' | 'track';
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  textColor: string;
}

export const PlaybackControls = React.memo(({
  isPlaying,
  isShuffled,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
  onPlayPause,
  onPrevious,
  onNext,
  textColor
}: PlaybackControlsProps) => {
  return (
    <View>
      {/* Secondary Controls (Shuffle/Repeat) */}
      <View style={styles.secondaryControls}>
        <Ionicons name="volume-medium-outline" size={24} color={textColor} />
        <View style={styles.rightSecondaryControls}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleRepeat();
            }}
            style={styles.secondaryBtn}
          >
            <Ionicons
              name={repeatMode === 'track' ? 'repeat' : 'repeat-outline'}
              size={20}
              color={repeatMode !== 'off' ? '#B34A30' : textColor}
            />
            {repeatMode !== 'off' && (
              <Text style={styles.modeLabel}>
                {repeatMode === 'track' ? '1' : 'All'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleShuffle();
            }}
            style={styles.secondaryBtn}
          >
            <Ionicons
              name="shuffle-outline"
              size={20}
              color={isShuffled ? '#B34A30' : textColor}
            />
            {isShuffled && <Text style={styles.modeLabel}>On</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Playback Controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPrevious();
          }}
          style={styles.controlBtn}
        >
          <Ionicons name="play-skip-back-outline" size={32} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onPlayPause();
          }}
          style={styles.playPauseBtn}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={44} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          style={styles.controlBtn}
        >
          <Ionicons name="play-skip-forward-outline" size={32} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  rightSecondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryBtn: {
    marginLeft: 24,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 8,
    color: '#B34A30',
    fontWeight: 'bold',
    marginTop: 2,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  controlBtn: {
    padding: 16,
  },
  playPauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B34A30',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#B34A30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
