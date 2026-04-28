import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";
import { LibraryService } from "../../services/api/libraryService";
import { Track } from "../../types";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { RootState, AppDispatch } from "../../redux/store/store";
import { useSelector, useDispatch } from "react-redux";
import { setQueue } from "../../redux/store/player/playerSlice";
import { removeTrackFromPlaylistAction } from "../../redux/store/library/librarySlice";
import { batchDownloadTracksAction } from "../../redux/store/downloads/downloadsSlice";
import { MainStack } from "../../navigation/AppNavigator";
import { DownloadButton } from "../../components/DownloadButton";

export default function PlaylistDetailScreen() {
  const route = useRoute<RouteProp<MainStack, "PlaylistDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const dispatch = useDispatch<AppDispatch>();
  const { playlistId, name } = route.params;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  useEffect(() => {
    fetchPlaylistTracks();
  }, [playlistId]);

  const fetchPlaylistTracks = async () => {
    try {
      setLoading(true);
      const data = await LibraryService.fetchPlaylistDetail(playlistId);
      setTracks(data.tracks || []);
    } catch (e) {
      console.error("Error fetching playlist tracks:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    dispatch(setQueue(tracks));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      await dispatch(removeTrackFromPlaylistAction({ playlistId, trackId })).unwrap();
      
      setTracks(prev => prev.filter(t => t.id !== trackId));
    } catch (e) {
      console.error("Failed to remove track:", e);
    }
  };

  const handleDownloadAll = () => {
    if (tracks.length > 0) {
      dispatch(batchDownloadTracksAction(tracks));
    }
  };

  const renderItem = ({ item, index }: { item: Track, index: number }) => (
    <View style={styles.trackCard}>
      <Text style={styles.trackNumber}>{index + 1}</Text>
      <TouchableOpacity 
        style={styles.trackInfo} 
        onPress={() => handlePlayTrack(item)}
      >
        <Image source={{ uri: item.image || "https://picsum.photos/200" }} style={styles.trackImage} />
        <View style={styles.textContainer}>
          <Text style={[styles.trackName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        <DownloadButton track={item} size={22} color={textColor} />
        <TouchableOpacity 
          style={styles.removeBtn} 
          onPress={() => handleRemoveTrack(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>{name}</Text>
          <Text style={styles.headerSubtitle}>{tracks.length} songs</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {isLoggedIn && (
            <TouchableOpacity style={styles.headerButton} onPress={handleDownloadAll} disabled={tracks.length === 0}>
              <Ionicons name="cloud-download-outline" size={24} color={textColor} style={{ opacity: tracks.length === 0 ? 0.5 : 1 }} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerButton} onPress={fetchPlaylistTracks}>
            <Ionicons name="refresh-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={60} color="#64748B" />
          <Text style={[styles.emptyText, { color: textColor }]}>This playlist is empty</Text>
          <Text style={styles.emptySubtext}>Add some songs from your library or search!</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderItem({ item, index })}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchPlaylistTracks}
              tintColor={accentColor}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerButton: {
    padding: 4,
    width: 40,
    alignItems: 'center'
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 16,
    padding: 10,
  },
  trackNumber: {
    width: 30,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 8,
  },
  trackInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: "#94A3B8",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeBtn: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});
