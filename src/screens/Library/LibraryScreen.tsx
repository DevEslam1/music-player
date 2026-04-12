import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { searchSongs } from "../../services/api/api";
import { Track } from "../../types";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { useDispatch, useSelector } from "react-redux";
import { setQueue } from "../../redux/store/player/playerSlice";
import { RootState } from "../../redux/store/store";

export default function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const { likedSongs, playlists } = useSelector((state: RootState) => state.library);
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const activeQuery = React.useRef<string>("");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const inputBg = useThemeColor({}, "inputBackground");
  const placeholderColor = useSelector((state: RootState) => state.theme.isDarkMode) ? "#94A3B8" : "#A0AEC0";

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
    }, 300); // Faster debounce for snappier feel

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const fetchResults = async (searchQuery: string) => {
    activeQuery.current = searchQuery;

    // 1. Local Search (The "Algorithm" improvement)
    const localLiked = likedSongs.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Remote Search
    try {
      const remoteTracks = await searchSongs(searchQuery);

      // 3. Race condition check
      if (activeQuery.current !== searchQuery) return;

      // 4. Combine and deduplicate
      const combined = [...localLiked];
      remoteTracks.forEach(rt => {
        if (!combined.find(lt => lt.id === rt.id)) {
          combined.push(rt);
        }
      });

      setResults(combined);
    } catch (e) {
      if (activeQuery.current === searchQuery) {
        setResults(localLiked);
      }
    } finally {
      if (activeQuery.current === searchQuery) {
        setLoading(false);
      }
    }
  };

  const handlePlayTrack = async (track: Track) => {
    dispatch(setQueue(results));
    await audioPlayer.loadPlayTrack(track);
  };

  const renderItem = ({ item }: { item: Track }) => {
    const isLiked = likedSongs.some(s => s.id === item.id);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePlayTrack(item)}>
        <Image source={{ uri: item.image || "https://picsum.photos/200" }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.artistRow}>
            {isLiked && <Ionicons name="heart" size={14} color="#B34A30" style={{ marginRight: 4 }} />}
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.artist}</Text>
          </View>
        </View>
        <Ionicons name="play-circle-outline" size={32} color="#B34A30" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Search Library</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: inputBg }]}>
        <Ionicons name="search" size={20} color={placeholderColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search songs, artists..."
          placeholderTextColor={placeholderColor}
          value={query}
          onChangeText={setQuery}
          autoFocus={true}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#B34A30" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            query.length > 0 ? (
              <Text style={[styles.emptyText, { color: textColor }]}>No results found.</Text>
            ) : null
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});

