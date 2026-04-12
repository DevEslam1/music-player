import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { searchSongs, getRecommendedSongs } from "../../services/api/api";
import { Track } from "../../types";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { setQueue } from "../../redux/store/player/playerSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import { fetchLikedSongs, fetchPlaylists } from "../../redux/store/library/librarySlice";

const TrackCard = ({ track, onPress, textColor }: { track: Track, onPress: () => void, textColor: string }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: track.image || "https://picsum.photos/200" }} style={styles.cardImage} />
    <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{track.name}</Text>
    <Text style={styles.cardSubtitle} numberOfLines={1}>{track.artist}</Text>
  </TouchableOpacity>
);

const SuggestionItem = ({ track, onPress, textColor }: { track: Track, onPress: () => void, textColor: string }) => (
  <TouchableOpacity style={styles.suggestionItem} onPress={onPress}>
    <Image source={{ uri: track.image || "https://picsum.photos/200" }} style={styles.suggestionImage} />
    <View style={styles.suggestionInfo}>
      <Text style={[styles.suggestionTitle, { color: textColor }]} numberOfLines={1}>{track.name}</Text>
      <Text style={styles.suggestionArtist} numberOfLines={1}>{track.artist}</Text>
    </View>
    <Ionicons name="play-circle-outline" size={28} color="#B34A30" />
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  
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
    return () => { isMounted = false };
  }, []);

  const handlePlayTrack = async (track: Track, queue: Track[]) => {
    dispatch(setQueue(queue));
    await audioPlayer.loadPlayTrack(track);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center' }]}>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Text style={[styles.sectionTitle, { color: textColor }]}>Recommended for you</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={recommended}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TrackCard
              track={item}
              textColor={textColor}
              onPress={() => handlePlayTrack(item, recommended)}
            />
          )}
        />

        <Text style={[styles.sectionTitle, { color: textColor }]}>Favorite Songs</Text>
        {likedSongs.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={likedSongs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TrackCard
                track={item}
                textColor={textColor}
                onPress={() => handlePlayTrack(item, likedSongs)}
              />
            )}
          />
        ) : (
          <TouchableOpacity 
            style={styles.emptyFavorite}
            onPress={() => navigation.navigate("Library")}
          >
            <Ionicons name="heart-outline" size={24} color="#B34A30" />
            <Text style={styles.emptyFavoriteText}>Tap ❤️ on a song to see it here</Text>
          </TouchableOpacity>
        )}

        <View style={styles.suggestionsHeader}>
          <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>Suggestions</Text>
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
  card: {
    width: 150,
    marginHorizontal: 8,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 16,
  },
  seeAll: {
    color: '#B34A30',
    fontSize: 14,
    fontWeight: '600',
  },
  verticalList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.3)', // Very soft border
  },
  suggestionImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionArtist: {
    fontSize: 13,
    color: '#94A3B8',
  },
  emptyFavorite: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(179, 74, 48, 0.05)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B34A30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyFavoriteText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});



