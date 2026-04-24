import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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

export default function HomeScreen() {
  const {
    recommended,
    setRecommended,
    suggestions,
    setSuggestions,
    loading,
    setLoading,
    handlePlayTrack,
  } = homeScreenLogic();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { likedSongs } = useSelector((state: RootState) => state.library);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        // Sync user library
        dispatch(fetchLikedSongs());
        dispatch(fetchPlaylists());

        const topTracks = await getRecommendedSongs();
        const suggestionTracks = await searchSongs("Jazz");
        if (isMounted) {
          setRecommended(topTracks.slice(0, 5));
          setSuggestions(suggestionTracks.slice(0, 6));
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#B34A30" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Library")}>
          <Ionicons name="search-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TrackList
          label="Recommended for you"
          trackList={recommended}
          handlePlayTrack={handlePlayTrack}
        />

        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Favorite Songs
        </Text>
        {likedSongs.length > 0 ? (
          <TrackList trackList={likedSongs} handlePlayTrack={handlePlayTrack} />
        ) : (
          <TouchableOpacity
            style={styles.emptyFavorite}
            onPress={() => navigation.navigate("Library")}
          >
            <Ionicons name="heart-outline" size={24} color="#B34A30" />
            <Text style={styles.emptyFavoriteText}>
              Tap ❤️ on a song to see it here
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.suggestionsHeader}>
          <Text
            style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}
          >
            Suggestions
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 80, // give space for miniplayer
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
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
  },
  emptyFavorite: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(179, 74, 48, 0.05)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B34A30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyFavoriteText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
