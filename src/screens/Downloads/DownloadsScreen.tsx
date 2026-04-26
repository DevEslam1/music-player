import React from "react";
import { Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "../../hooks/use-theme-color";
import { ScreenHeader } from "../../components/ScreenHeader";
import { downloadsScreenLogic } from "../../services/logic/downloadsScreenLogic";
import { Ionicons } from "@expo/vector-icons";

export default function DownloadsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const {
    downloadedTracks,
    loading,
    handlePlayTrack,
    handleDeleteDownload
  } = downloadsScreenLogic();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader screenTitle="Offline Library" />

      {loading ? (
        <ActivityIndicator size="large" color="#B34A30" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={downloadedTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.trackItem}
              onPress={() => handlePlayTrack(item)}
            >
              <Image source={{ uri: item.image }} style={styles.artwork} />
              
              <View style={styles.trackInfo}>
                <Text style={[styles.trackName, { color: textColor }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.artistName} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteDownload(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-offline-outline" size={64} color="#CBD5E1" />
              <Text style={[styles.emptyText, { color: textColor }]}>
                No offline tracks yet.
              </Text>
              <Text style={styles.emptySubText}>
                Download tracks to listen when you're not connected to the internet.
              </Text>
            </View>
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
    justifyContent: "center",
  },
  trackName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: "#64748B",
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  }
});
