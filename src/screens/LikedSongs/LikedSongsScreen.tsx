import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { fetchLikedSongs } from "../../redux/store/library/librarySlice";
import { RootState } from "../../redux/store/store";
import { useSelector, useDispatch } from "react-redux";
import { ScreenHeader } from "../../components/ScreenHeader";
import { LikedSongCard } from "../../components/liked/LikedSongCard";
import { useLikedScreenLogic } from "../../services/logic/likedScreenLogic";
import { setAutoDownloadEnabled, batchDownloadTracksAction } from "../../redux/store/downloads/downloadsSlice";

export default function LikedSongsScreen() {
  const {
    likedSongs,
    loading,
    isEditMode,
    dispatch,
    setIsEditMode,
    handlePlay,
    handleRemove,
  } = useLikedScreenLogic();

  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const autoDownloadEnabled = useSelector(
    (state: RootState) => state.downloads.autoDownloadEnabled,
  );
  
  const likedSongsLastFetchedAt = useSelector(
    (state: RootState) => state.library.likedSongsLastFetchedAt,
  );

  React.useEffect(() => {
    if (!likedSongsLastFetchedAt) {
      dispatch(fetchLikedSongs());
    }
  }, [dispatch, likedSongsLastFetchedAt]);

  React.useEffect(() => {
    if (autoDownloadEnabled && likedSongs.length > 0) {
      dispatch(batchDownloadTracksAction(likedSongs));
    }
  }, [likedSongs, autoDownloadEnabled, dispatch]);

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
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        screenTitle="Liked Songs"
        leftIcon="menu"
        onBack={() => navigation.openDrawer()}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isLoggedIn && (
              <TouchableOpacity 
                onPress={() => {
                  dispatch(setAutoDownloadEnabled(true));
                  if (likedSongs.length > 0) {
                    dispatch(batchDownloadTracksAction(likedSongs));
                  }
                }}
                style={{ marginRight: 15, padding: 4 }}
              >
                <Ionicons 
                  name={autoDownloadEnabled ? "cloud-done" : "cloud-offline"} 
                  size={26} 
                  color={autoDownloadEnabled ? accentColor : "#94A3B8"} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={{ padding: 4 }}>
              <Ionicons name={isEditMode ? "checkmark-circle" : "options-outline"} size={26} color={accentColor} />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 100 }]}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : likedSongs.length === 0 ? (
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 100 }]}>
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
          contentContainerStyle={[
            styles.listContainer, 
            { paddingTop: insets.top + 85 }
          ]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12, // Ensure negative top badge isn't clipped
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
