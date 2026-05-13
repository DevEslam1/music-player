import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store/store';
import { playNext, addToQueue } from '../redux/store/player/playerSlice';
import { showBanner } from '../redux/store/ui/uiSlice';
import { useThemeColor, useAccentColor } from '../hooks/use-theme-color';
import { Track } from '../types';

const { height } = Dimensions.get('window');

interface TrackOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  track: Track | null;
  onAddToPlaylist?: (track: Track) => void;
}

export function TrackOptionsModal({ isVisible, onClose, track, onAddToPlaylist }: TrackOptionsModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useAccentColor();

  const handlePlayNext = () => {
    if (track) {
      dispatch(playNext(track));
      dispatch(showBanner({ message: "Added to play next", type: "success" }));
    }
    onClose();
  };

  const handleAddToQueue = () => {
    if (track) {
      dispatch(addToQueue(track));
      dispatch(showBanner({ message: "Added to queue", type: "success" }));
    }
    onClose();
  };

  const handleAddToPlaylistPress = () => {
    if (track && onAddToPlaylist) {
      onAddToPlaylist(track);
    }
    onClose();
  };

  if (!track) return null;

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.content, { backgroundColor }]} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <View style={styles.trackInfo}>
              <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                {track.name}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {track.artist}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.optionItem} onPress={handlePlayNext}>
            <Ionicons name="play-forward-outline" size={24} color={textColor} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: textColor }]}>Play Next</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleAddToQueue}>
            <Ionicons name="list-outline" size={24} color={textColor} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: textColor }]}>Add to Queue</Text>
          </TouchableOpacity>

          {onAddToPlaylist && (
            <TouchableOpacity style={styles.optionItem} onPress={handleAddToPlaylistPress}>
              <Ionicons name="albums-outline" size={24} color={textColor} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: textColor }]}>Add to Playlist</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 16,
  },
  trackInfo: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
  },
});
