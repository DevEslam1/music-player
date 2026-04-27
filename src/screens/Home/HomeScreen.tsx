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
import { useThemeColor } from "../../hooks/use-theme-color";
import { searchSongs, getRecommendedSongs } from "../../services/api/api";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import {
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

import { useAccentColor } from "../../hooks/use-theme-color";

export default function HomeScreen() {
  const {
    recommended,
    setRecommended,
    suggestions,
    setSuggestions,
    fullSuggestions,
    setFullSuggestions,
    loading,
    setLoading,
    handlePlayTrack,
  } = homeScreenLogic();
  
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { likedSongs } = useSelector((state: RootState) => state.library);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        dispatch(fetchLikedSongs());
        dispatch(fetchPlaylists());

        const topTracks = await getRecommendedSongs();
        const suggestionTracks = await searchSongs("Jazz");
        
        if (isMounted) {
          setRecommended(topTracks.slice(0, 5));
          setSuggestions(suggestionTracks.slice(0, 6));
          setFullSuggestions(suggestionTracks);
          
          // Small delay for the shimmer effect to feel smooth
          setTimeout(() => {
            if (isMounted) setLoading(false);
          }, 800);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };
    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, [dispatch, setRecommended, setSuggestions, setFullSuggestions, setLoading]);

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
          trackList={recommended}
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
              tracks: fullSuggestions,
              query: "Jazz"
            })}
          >
            <Text style={[styles.seeAll, { color: accentColor }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Suggestion List */}
        <View style={styles.verticalList}>
          {suggestions.map((item) => (
            <SuggestionItem
              key={item.id}
              track={item}
              textColor={textColor}
              onPress={() => handlePlayTrack(item, suggestions)}
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
    color: "#B34A30",
    fontSize: 14,
    fontWeight: "600",
  },
  verticalList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  }
});
