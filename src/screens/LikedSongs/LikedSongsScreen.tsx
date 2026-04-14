import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks/use-theme-color";
import { fetchLikedSongs } from "../../redux/store/library/librarySlice";
import { ScreenHeader } from "../../components/ScreenHeader";
import { LikedSongCard } from "../../components/liked/LikedSongCard";
import { likedScreenLogic } from "../../services/logic/likedScreenLogic";

export default function LikedSongsScreen() {
  const {
    likedSongs,
    loading,
    isEditMode,
    dispatch,
    setIsEditMode,
    handlePlay,
    handleRemove,
  } = likedScreenLogic();

  React.useEffect(() => {
    dispatch(fetchLikedSongs());
  }, []);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ScreenHeader
        screenTitle="Liked Songs"
        postIcon={isEditMode ? "checkmark-circle" : "options-outline"}
        onPostPress={() => setIsEditMode(!isEditMode)}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B34A30" />
        </View>
      ) : likedSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-dislike-outline" size={60} color="#64748B" />
          </View>
          <Text style={[styles.emptyText, { color: textColor }]}>
            No liked songs yet.
          </Text>
          <Text style={styles.emptySubtext}>
            Find a song you love and tap the heart!
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <LikedSongCard
              item={item}
              onPress={() => handlePlay(item)}
              editMode={isEditMode}
              onRemove={() => handleRemove(item)}
            />
          )}
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 24,
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
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
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
