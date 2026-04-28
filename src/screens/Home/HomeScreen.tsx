import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useAccentColor, useColorScheme, useBlurSettings } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { RootState, AppDispatch } from "../../redux/store/store";
import {
  fetchHomeFeed,
  fetchLikedSongs,
  fetchPlaylists,
} from "../../redux/store/library/librarySlice";
import { SuggestionItem } from "../../components/home/SuggestionItem";
import { TrackList } from "../../components/home/TrackList";
import { useHomeScreenLogic } from "../../services/logic/homeScreenLogic";
import { HomeSkeleton } from "../../components/home/HomeSkeleton";

// Smaller, reusable components for a cleaner codebase! 
import { ScreenHeader } from "../../components/ScreenHeader";
import { EmptyFavorite } from "../../components/home/EmptyFavorite";
import Ionicons from "@expo/vector-icons/build/Ionicons";

/**
 * Professional Junior Refactor:
 * I've sliced the HomeScreen into smaller pieces.
 * 1. ScreenHeader - Premium glass-morphism header for top menu and search.
 * 2. EmptyFavorite - Shown when no songs are liked.
 * 
 * Slicing makes code much easier to maintain and faster to render! 🚀
 */

export default function HomeScreen() {
  const { handlePlayTrack } = useHomeScreenLogic();
  
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const {
    likedSongs,
    likedSongsLastFetchedAt,
    playlistsLastFetchedAt,
    homeFeed,
    loadingStates,
  } = useSelector((state: RootState) => state.library);
  
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const { advancedBlurEnabled, blurIntensity } = useBlurSettings();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

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
  }, [dispatch]);

  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchLikedSongs()),
      dispatch(fetchPlaylists()),
      dispatch(fetchHomeFeed())
    ]);
    setRefreshing(false);
  }, [dispatch]);

  // Memoized handlers for child components
  const onOpenDrawer = useCallback(() => navigation.openDrawer(), [navigation]);
  const onNavigateLibrary = useCallback(() => navigation.navigate("Library"), [navigation]);

  if (loading && !refreshing) {
    return <HomeSkeleton />;
  }

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
              { backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)" }
            ]}
          />
        </View>
      )}

      <View style={styles.container}>
        {/* Top Header Section */}
        <ScreenHeader
          screenTitle="GiG Player"
          leftIcon="menu-outline"
          onBack={onOpenDrawer}
          rightComponent={
             <TouchableOpacity onPress={onNavigateLibrary}>
               <Ionicons name="search-outline" size={24} color={textColor} />
             </TouchableOpacity>
          }
        />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 85 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
        }
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
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, 
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
