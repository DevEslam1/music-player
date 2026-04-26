import React, { useState, useEffect } from "react";
import { Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "../../hooks/use-theme-color";
import { SearchBar } from "../../components/library/SearchBar";
import { SearchItem } from "../../components/library/SearchItem";
import PlaylistPicker from "../../components/PlaylistPicker";
import { ScreenHeader } from "../../components/ScreenHeader";
import { libraryScreenLogic } from "../../services/logic/libraryScreenLogic";

export default function LibraryScreen() {
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const {
    query,
    setQuery,
    results,
    setResults,
    loading,
    setLoading,
    isPickerVisible,
    setIsPickerVisible,
    selectedTrack,
    likedSongs,
    fetchResults,
    handlePlayTrack,
    handleAddToPlaylist,
    handleOpenPicker,
  } = libraryScreenLogic();

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.trim() === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchTimeout.current = setTimeout(() => {
      fetchResults(query);
    }, 300); 

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {}
      <ScreenHeader screenTitle="Search Library" />

      {}
      <SearchBar
        query={query}
        onChangeText={setQuery}
        onSearchPress={() => setQuery("")}
      />

      {}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#B34A30"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <SearchItem
              item={item}
              onPlayTrack={() => handlePlayTrack(item)}
              onOpenPicker={() => handleOpenPicker(item)}
              isLiked={likedSongs.some((s) => s.id === item.id)}
            />
          )}
          ListEmptyComponent={
            query.length > 0 ? (
              <Text style={[styles.emptyText, { color: textColor }]}>
                No results found.
              </Text>
            ) : null
          }
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
