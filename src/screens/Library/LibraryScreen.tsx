import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { useThemeColor, useAccentColor, useColorScheme, useBlurSettings } from "../../hooks/use-theme-color";
import { ScreenHeader } from "../../components/ScreenHeader";
import { RootState, AppDispatch } from "../../redux/store/store";
import { useLibraryScreenLogic } from "../../services/logic/libraryScreenLogic";
import { SearchBar } from "../../components/library/SearchBar";
import { SearchItem } from "../../components/library/SearchItem";
import { TrackOptionsModal } from "../../components/TrackOptionsModal";
import PlaylistPicker from "../../components/PlaylistPicker";
import { setAutoDownloadEnabled, batchDownloadTracksAction } from "../../redux/store/downloads/downloadsSlice";
import { fetchHomeFeed, clearRecentSearches } from "../../redux/store/library/librarySlice";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const {
    query,
    setQuery,
    results,
    loading,
    fetchResults,
    handlePlayTrack,
    likedSongs,
    recentSearches,
    suggestions,
    isPickerVisible,
    setIsPickerVisible,
    isOptionsVisible,
    setIsOptionsVisible,
    selectedTrack,
    handleAddToPlaylist,
    handleOpenPicker,
  } = useLibraryScreenLogic();

  const TypedFlashList = FlashList as any;
  
  const history = useSelector((state: RootState) => state.history.recentTracks);
  const localTracks = useSelector((state: RootState) => state.localLibrary.tracks);
  
  const mostPlayed = [...history]
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 15);
    
  const recentlyAdded = [...likedSongs, ...localTracks]
    .sort((a, b) => b.id.localeCompare(a.id)) // Proxy for 'recently added' using ID or just reverse order
    .slice(0, 15);
  
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const { advancedBlurEnabled, blurIntensity } = useBlurSettings();
  const autoDownloadEnabled = useSelector(
    (state: RootState) => state.downloads.autoDownloadEnabled,
  );
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchResults(query);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    dispatch(fetchHomeFeed());
  }, [dispatch]);

  const isLiked = useCallback((trackId: string) => {
    return likedSongs.some(s => s.id === trackId);
  }, [likedSongs]);

  const renderEmptyState = () => {
    if (query) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>
            No songs found
          </Text>
        </View>
      );
    }

    const showRecent = recentSearches.length > 0;
    const dataToShow = showRecent ? recentSearches : suggestions.slice(0, 5);
    const title = showRecent ? "Recent Searches" : "Suggestions for you";

    if (dataToShow.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>
            Your library search results will appear here.
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {/* Smart Playlists Section */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Smart Playlists</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartPlaylistContainer}>
          <TouchableOpacity 
            style={[styles.smartCard, { backgroundColor: accentColor + '22' }]}
            onPress={() => handlePlayTrack(recentlyAdded[0], recentlyAdded)}
          >
            <Ionicons name="sparkles" size={24} color={accentColor} />
            <Text style={[styles.smartTitle, { color: textColor }]}>Recently Added</Text>
            <Text style={styles.smartSubtitle}>{recentlyAdded.length} tracks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.smartCard, { backgroundColor: accentColor + '22' }]}
            onPress={() => handlePlayTrack(mostPlayed[0], mostPlayed)}
          >
            <Ionicons name="stats-chart" size={24} color={accentColor} />
            <Text style={[styles.smartTitle, { color: textColor }]}>Most Played</Text>
            <Text style={styles.smartSubtitle}>Your Top Mix</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.smartCard, { backgroundColor: accentColor + '22' }]}
            onPress={() => handlePlayTrack(likedSongs[0], likedSongs)}
          >
            <Ionicons name="heart" size={24} color={accentColor} />
            <Text style={[styles.smartTitle, { color: textColor }]}>Liked Songs</Text>
            <Text style={styles.smartSubtitle}>{likedSongs.length} tracks</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor, flex: 1 }]}>{title}</Text>
          {showRecent && (
            <TouchableOpacity onPress={() => dispatch(clearRecentSearches())}>
              <Text style={{ color: accentColor, marginRight: 16, fontSize: 14 }}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <TypedFlashList
          data={dataToShow}
          renderItem={({ item }) => (
            <SearchItem
              item={item}
              onPlayTrack={() => handlePlayTrack(item, dataToShow)}
              onOpenPicker={() => handleOpenPicker(item)}
              isLiked={isLiked(item.id)}
              hideDownload={true}
            />
          )}
          keyExtractor={(item) => `empty-${item.id}`}
          contentContainerStyle={styles.listContainer}
          estimatedItemSize={72}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Dynamic Glass-Morphism Background Overlay */}
      {advancedBlurEnabled && (
        <View style={StyleSheet.absoluteFill}>
          {currentTrack?.image && (
            <Image 
              source={{ uri: currentTrack.image }} 
              style={StyleSheet.absoluteFill}
              blurRadius={Platform.OS === 'ios' ? 80 : 30} 
            />
          )}
          <BlurView
            intensity={blurIntensity}
            tint={isDarkMode ? "dark" : "light"}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isDarkMode ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.45)" }
            ]}
          />
        </View>
      )}

    <View style={styles.container}>
      <ScreenHeader
        screenTitle="Search"
        leftIcon="arrow-back"
        rightComponent={null}
      />

      <View style={[styles.searchContainer, { paddingTop: insets.top + 85 }]}>
        <SearchBar
          query={query}
          onChangeText={setQuery}
          onSearchPress={() => setQuery("")}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (query === "" || results.length === 0) ? (
        renderEmptyState()
      ) : (
        <TypedFlashList
          data={results}
          renderItem={({ item }) => (
            <SearchItem
              item={item}
              onPlayTrack={() => handlePlayTrack(item)}
              onOpenPicker={() => handleOpenPicker(item)}
              isLiked={isLiked(item.id)}
              hideDownload={true}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          estimatedItemSize={72}
        />
      )}

      <TrackOptionsModal
        isVisible={isOptionsVisible}
        onClose={() => setIsOptionsVisible(false)}
        track={selectedTrack}
        onAddToPlaylist={() => setIsPickerVisible(true)}
      />

      <PlaylistPicker
        isVisible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelect={handleAddToPlaylist}
      />
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingBottom: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  smartPlaylistContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  smartCard: {
    width: 140,
    height: 140,
    borderRadius: 24,
    padding: 16,
    marginRight: 12,
    justifyContent: 'flex-end',
  },
  smartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  smartSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});
