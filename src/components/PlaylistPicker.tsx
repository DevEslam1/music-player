import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store/store';
import { fetchPlaylists, createPlaylistAction, addTrackToPlaylistAction } from '../redux/store/library/librarySlice';
import { useThemeColor, useAccentColor } from '../hooks/use-theme-color';
import { PlaylistSummary, Track } from '../types';
import { showBanner } from '../redux/store/ui/uiSlice';

const { height } = Dimensions.get('window');

interface PlaylistPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (playlistId: string) => void;
  track?: Track | null;
}

export default function PlaylistPicker({ isVisible, onClose, onSelect, track }: PlaylistPickerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const playlists = useSelector((state: RootState) => state.library.playlists);
  const playlistsLastFetchedAt = useSelector((state: RootState) => state.library.playlistsLastFetchedAt);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useAccentColor();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchPlaylists()).unwrap();
    } catch (e) {
      console.error("Failed to refresh playlists in picker:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim() || !track) return;
    try {
      const result = await dispatch(createPlaylistAction(newPlaylistName.trim())).unwrap();
      await dispatch(addTrackToPlaylistAction({ playlistId: result.id, track })).unwrap();
      dispatch(showBanner({ message: `"${track.name}" added to "${result.name}"`, type: "success" }));
      setNewPlaylistName('');
      setIsCreating(false);
      onClose();
    } catch (e) {
      dispatch(showBanner({ message: "Failed to create playlist", type: "error" }));
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      // Auto-refresh if data is older than 1 minute or never fetched
      const now = Date.now();
      const last = playlistsLastFetchedAt || 0;
      if (now - last > 60000) {
        dispatch(fetchPlaylists());
      }
    }
  }, [isVisible, dispatch, playlistsLastFetchedAt]);
  
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
        <Text style={styles.count}>{(item as any).track_count ?? item.tracks?.length ?? 0} songs</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIsCreating(!isCreating)} style={{ marginRight: 20 }}>
                <Ionicons 
                  name={isCreating ? "close" : "add-circle-outline"} 
                  size={24} 
                  color={textColor} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>

          {isCreating && (
            <View style={[styles.createForm, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
              <TextInput
                style={[styles.input, { color: textColor, borderBottomColor: accentColor }]}
                placeholder="New playlist name..."
                placeholderTextColor="#94A3B8"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
                selectionColor={accentColor}
              />
              <TouchableOpacity 
                style={[styles.createBtn, { backgroundColor: accentColor }]}
                onPress={handleCreateAndAdd}
                disabled={!newPlaylistName.trim() || !track}
              >
                <Text style={styles.createBtnText}>Create & Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {playlists.length > 0 ? (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
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
  createForm: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  input: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  createBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
