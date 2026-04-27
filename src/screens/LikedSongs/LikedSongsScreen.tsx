import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { fetchLikedSongs } from "../../redux/store/library/librarySlice";
import { RootState } from "../../redux/store/store";
import { useSelector } from "react-redux";
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
  const likedSongsLastFetchedAt = useSelector(
    (state: RootState) => state.library.likedSongsLastFetchedAt,
  );

  React.useEffect(() => {
    if (!likedSongsLastFetchedAt) {
      dispatch(fetchLikedSongs());
    }
  }, [dispatch, likedSongsLastFetchedAt]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchLikedSongs()).unwrap();
    } catch (error) {
      console.log("Failed to refresh liked songs:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {}
      <ScreenHeader
        screenTitle="Liked Songs"
        postIcon={isEditMode ? "checkmark-circle" : "options-outline"}
        onPostPress={() => setIsEditMode(!isEditMode)}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={accentColor}
            />
          }
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
