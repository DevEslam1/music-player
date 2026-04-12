import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import { setQueue } from "../../redux/store/player/playerSlice";
import { fetchLikedSongs, toggleLikeSongAction } from "../../redux/store/library/librarySlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { Track } from "../../types";

export default function LikedSongsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { likedSongs, loading } = useSelector((state: RootState) => state.library);
  const [isEditMode, setIsEditMode] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchLikedSongs());
  }, []);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const handlePlay = async (track: Track) => {
    if (isEditMode) return; // Prevent playing while editing
    dispatch(setQueue(likedSongs));
    await audioPlayer.loadPlayTrack(track);
  };

  const handleRemove = (track: Track) => {
    dispatch(toggleLikeSongAction(track));
  };

  const renderItem = ({ item }: { item: Track }) => (
    <TouchableOpacity 
      style={[styles.card, isEditMode && styles.cardEdit]} 
      onPress={() => handlePlay(item)}
      activeOpacity={isEditMode ? 1 : 0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image || "https://picsum.photos/200" }} style={styles.cardImage} />
        {isEditMode && (
          <TouchableOpacity 
            style={styles.removeBadge} 
            onPress={() => handleRemove(item)}
          >
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Liked Songs</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setIsEditMode(!isEditMode)}
          disabled={likedSongs.length === 0}
        >
          <Ionicons 
            name={isEditMode ? "checkmark-circle" : "options-outline"} 
            size={26} 
            color={isEditMode ? "#B34A30" : textColor} 
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B34A30" />
        </View>
      ) : likedSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-dislike-outline" size={60} color="#64748B" />
          </View>
          <Text style={[styles.emptyText, { color: textColor }]}>No liked songs yet.</Text>
          <Text style={styles.emptySubtext}>Find a song you love and tap the heart!</Text>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          extraData={isEditMode}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    width: "48%",
  },
  cardEdit: {
    opacity: 0.9,
  },
  imageContainer: {
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  removeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
