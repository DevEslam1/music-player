import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAccentColor } from '../../hooks/use-theme-color';

/**
 * Junior Dev Comment:
 * Here are the cool play/pause buttons! 
 * I also added haptic feedback (vibrations) to make it feel premium.
 */

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'queue' | 'track';
  canGoNext: boolean;
  canGoPrevious: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenQueue: () => void;
  textColor: string;
}

export const PlaybackControls = React.memo(({
  isPlaying,
  isShuffled,
  repeatMode,
  canGoNext,
  canGoPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onPlayPause,
  onPrevious,
  onNext,
  onOpenQueue,
  textColor
}: PlaybackControlsProps) => {
  const accentColor = useAccentColor();
  const { height } = useWindowDimensions();
  const isShortScreen = height < 750;

  const playPauseSize = isShortScreen ? 68 : 80;
  const playIconSize = isShortScreen ? 38 : 48;
  const skipIconSize = isShortScreen ? 28 : 36;

  // Repeat-queue/track overrides edge disabling — shuffle always allows next
  const prevEnabled = canGoPrevious || repeatMode === 'queue' || isShuffled;
  const nextEnabled = canGoNext || repeatMode === 'queue' || repeatMode === 'track' || isShuffled;

  return (
    <View>
      {/* Secondary Controls (Shuffle/Repeat) */}
      <View style={[styles.secondaryControls, isShortScreen && { marginBottom: 8 }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenQueue();
          }}
          style={styles.secondaryBtnLeft}
        >
          <Ionicons name="list-outline" size={24} color={textColor} />
        </TouchableOpacity>
        
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
              color={repeatMode !== 'off' ? accentColor : textColor}
            />
            {repeatMode !== 'off' && (
              <Text style={[styles.modeLabel, { color: accentColor }]}>
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
              color={isShuffled ? accentColor : textColor}
            />
            {isShuffled && <Text style={[styles.modeLabel, { color: accentColor }]}>On</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Playback Controls */}
      <View style={[styles.mainControls, isShortScreen && { marginTop: 8 }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPrevious();
          }}
          style={[
            styles.controlBtn, 
            isShortScreen && { padding: 12 },
            !prevEnabled && styles.disabledBtn
          ]}
          disabled={!prevEnabled}
        >
          <Ionicons
            name="play-skip-back-outline"
            size={skipIconSize}
            color={prevEnabled ? textColor : `${textColor}44`}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onPlayPause();
          }}
          style={[
            styles.playPauseBtn, 
            { 
              backgroundColor: accentColor, 
              shadowColor: accentColor,
              width: playPauseSize,
              height: playPauseSize,
              borderRadius: playPauseSize / 2,
              marginHorizontal: isShortScreen ? 20 : 32
            }
          ]}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={playIconSize} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          style={[
            styles.controlBtn, 
            isShortScreen && { padding: 12 },
            !nextEnabled && styles.disabledBtn
          ]}
          disabled={!nextEnabled}
        >
          <Ionicons
            name="play-skip-forward-outline"
            size={skipIconSize}
            color={nextEnabled ? textColor : `${textColor}44`}
          />
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
  secondaryBtnLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  secondaryBtn: {
    marginLeft: 24,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  centerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  controlBtn: {
    padding: 16,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  playPauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 32,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
