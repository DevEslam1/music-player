import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
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
import PlaylistPicker from "../../components/PlaylistPicker";
import { setAutoDownloadEnabled, batchDownloadTracksAction } from "../../redux/store/downloads/downloadsSlice";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const {
    query,
    setQuery,
    results,
    loading,
    fetchResults,
    handlePlayTrack,
    handleOpenPicker,
    isPickerVisible,
    setIsPickerVisible,
    handleAddToPlaylist,
    likedSongs,
  } = useLibraryScreenLogic();
  
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
      } else {
        // If query is empty, maybe show liked songs as default or empty results
        fetchResults(query);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const isLiked = useCallback((trackId: string) => {
    return likedSongs.some(s => s.id === trackId);
  }, [likedSongs]);

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
        rightComponent={
          isLoggedIn && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => {
                  dispatch(setAutoDownloadEnabled(true));
                  if (results?.length > 0) {
                    dispatch(batchDownloadTracksAction(results));
                  }
                }}
                style={{ padding: 4 }}
              >
                <Ionicons 
                  name={autoDownloadEnabled ? "cloud-done" : "cloud-offline"} 
                  size={26} 
                  color={autoDownloadEnabled ? accentColor : "#94A3B8"} 
                />
              </TouchableOpacity>
            </View>
          )
        }
      />

      <View style={[styles.searchContainer, { paddingTop: insets.top + 82 }]}>
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
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>
            {query ? "No songs found" : "Your library search results will appear here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={({ item }) => (
            <SearchItem
              item={item}
              onPlayTrack={() => handlePlayTrack(item)}
              onOpenPicker={() => handleOpenPicker(item)}
              isLiked={isLiked(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

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
});
