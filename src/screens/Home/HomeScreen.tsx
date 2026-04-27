import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import {
  fetchHomeFeed,
  fetchLikedSongs,
  fetchPlaylists,
} from "../../redux/store/library/librarySlice";
import { SuggestionItem } from "../../components/home/SuggestionItem";
import { TrackList } from "../../components/home/TrackList";
import { homeScreenLogic } from "../../services/logic/homeScreenLogic";
import { HomeSkeleton } from "../../components/home/HomeSkeleton";

// Smaller, reusable components for a cleaner codebase! 
import { HomeHeader } from "../../components/home/HomeHeader";
import { EmptyFavorite } from "../../components/home/EmptyFavorite";

/**
 * Professional Junior Refactor:
 * I've sliced the HomeScreen into smaller pieces.
 * 1. HomeHeader - Handles the top menu and search icons.
 * 2. EmptyFavorite - Shown when no songs are liked.
 * 
 * Slicing makes code much easier to maintain and faster to render! 🚀
 */

export default function HomeScreen() {
  const { handlePlayTrack } = homeScreenLogic();
  
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const {
    likedSongs,
    likedSongsLastFetchedAt,
    playlistsLastFetchedAt,
    homeFeed,
    loadingStates,
  } = useSelector((state: RootState) => state.library);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const loading =
    loadingStates.homeFeed === "loading" && homeFeed.recommended.length === 0;

  useEffect(() => {
    if (!likedSongsLastFetchedAt && loadingStates.likedSongs !== "loading") {
      dispatch(fetchLikedSongs());
    }

    if (!playlistsLastFetchedAt && loadingStates.playlists !== "loading") {
      dispatch(fetchPlaylists());
    }

    dispatch(fetchHomeFeed());
  }, [
    dispatch,
    likedSongsLastFetchedAt,
    loadingStates.likedSongs,
    loadingStates.playlists,
    playlistsLastFetchedAt,
  ]);

  // Memoized handlers for child components
  const onOpenDrawer = useCallback(() => navigation.openDrawer(), [navigation]);
  const onNavigateLibrary = useCallback(() => navigation.navigate("Library"), [navigation]);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Top Header Section */}
      <HomeHeader 
        onOpenDrawer={onOpenDrawer}
        onNavigateLibrary={onNavigateLibrary}
        textColor={textColor}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Horizontal Recommended List */}
        <TrackList
          label="Recommended for you"
          trackList={homeFeed.recommended}
          handlePlayTrack={handlePlayTrack}
        />

        {/* Liked Songs / Favorites Section */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Favorite Songs
        </Text>
        {likedSongs.length > 0 ? (
          <TrackList trackList={likedSongs} handlePlayTrack={handlePlayTrack} />
        ) : (
          <EmptyFavorite onPress={onNavigateLibrary} />
        )}

        {/* Suggestions Section with "See all" trigger */}
        <View style={styles.suggestionsHeader}>
          <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>
            Suggestions
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("TracksList", { 
              title: "Suggestions", 
              tracks: homeFeed.fullSuggestions,
              query: "Jazz"
            })}
          >
            <Text style={[styles.seeAll, { color: accentColor }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Suggestion List */}
        <View style={styles.verticalList}>
          {homeFeed.suggestions.map((item) => (
            <SuggestionItem
              key={item.id}
              track={item}
              textColor={textColor}
              onPress={() => handlePlayTrack(item, homeFeed.fullSuggestions)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, 
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  suggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  verticalList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  }
});
