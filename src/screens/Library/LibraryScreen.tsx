import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { ScreenHeader } from "../../components/ScreenHeader";
import { RootState, AppDispatch } from "../../redux/store/store";
import { libraryScreenLogic } from "../../services/logic/libraryScreenLogic";
import { SearchBar } from "../../components/library/SearchBar";
import { SearchItem } from "../../components/library/SearchItem";
import PlaylistPicker from "../../components/PlaylistPicker";
import { setAutoDownloadEnabled, batchDownloadTracksAction } from "../../redux/store/downloads/downloadsSlice";

export default function LibraryScreen() {
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
  } = libraryScreenLogic();
  
  const dispatch = useDispatch<AppDispatch>();
  const autoDownloadEnabled = useSelector(
    (state: RootState) => state.downloads.autoDownloadEnabled,
  );

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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        screenTitle="Library"
        leftIcon="arrow-back"
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => {
                const newValue = !autoDownloadEnabled;
                dispatch(setAutoDownloadEnabled(newValue));
                if (newValue && results?.length > 0) {
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
        }
      />

      <View style={styles.searchContainer}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingVertical: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
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
