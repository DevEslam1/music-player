import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Track } from '../../types';

/**
 * Junior Developer Note:
 * This component shows the track name, artist, and action buttons like "Add to Playlist" and "Like".
 * 
 * Performance Tip:
 * We use React.memo so this doesn't re-render every time the progress bar updates! 
 */

interface TrackMetaInfoProps {
  track: Track;
  isLiked: boolean;
  onToggleLike: () => void;
  onAddToPlaylist: () => void;
  textColor: string;
}

export const TrackMetaInfo = React.memo(({
  track,
  isLiked,
  onToggleLike,
  onAddToPlaylist,
  textColor
}: TrackMetaInfoProps) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.textStack}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      <View style={styles.actionsBox}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddToPlaylist();
          }}
          style={styles.actionBtn}
        >
          <Ionicons name="add-circle-outline" size={28} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onToggleLike();
          }}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={isLiked ? '#B34A30' : textColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    position: 'relative',
  },
  textStack: {
    alignItems: 'center',
    paddingHorizontal: 54,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  artist: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  actionsBox: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginRight: 16,
  },
});
