import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { useThemeColor, useAccentColor } from '../hooks/use-theme-color';
import { PlaylistSummary } from '../types';

const { height } = Dimensions.get('window');

interface PlaylistPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (playlistId: string) => void;
}

export default function PlaylistPicker({ isVisible, onClose, onSelect }: PlaylistPickerProps) {
  const playlists = useSelector((state: RootState) => state.library.playlists);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useAccentColor();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  
  const renderItem = ({ item }: { item: PlaylistSummary }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]} 
      onPress={() => onSelect(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
        <Ionicons name="apps-outline" size={24} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
        <Text style={styles.count}>{item.tracks?.length || 0} songs</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={[styles.content, { backgroundColor }]}
          onStartShouldSetResponder={() => true} 
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Add to Playlist</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {playlists.length > 0 ? (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: textColor }]}>No playlists found</Text>
              <Text style={styles.emptySubtext}>Create a playlist in the Library screen first.</Text>
            </View>
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
    height: height * 0.6,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(179, 74, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
