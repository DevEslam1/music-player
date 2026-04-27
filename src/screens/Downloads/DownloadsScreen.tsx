import React from "react";
import { Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { ScreenHeader } from "../../components/ScreenHeader";
import { downloadsScreenLogic } from "../../services/logic/downloadsScreenLogic";
import { Ionicons } from "@expo/vector-icons";
import { DownloadButton } from "../../components/DownloadButton";
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function DownloadsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const {
    downloadedTracks,
    loading,
    handlePlayTrack,
    handleDeleteDownload,
    handleDeleteAll,
    totalStorage
  } = downloadsScreenLogic();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderRightActions = (trackId: string) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDeleteDownload(trackId)}
      >
        <Ionicons name="trash-outline" size={24} color="#FFF" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader 
        screenTitle="Offline Library" 
        postIcon={downloadedTracks.length > 0 ? "trash-outline" : undefined}
        onPostPress={handleDeleteAll}
      />

      {downloadedTracks.length > 0 && (
        <View style={styles.storageCard}>
          <View style={[styles.storageIconWrapper, { backgroundColor: accentColor + '15' }]}>
            <Ionicons name="stats-chart" size={20} color={accentColor} />
          </View>
          <View>
            <Text style={[styles.storageTitle, { color: textColor }]}>Storage Used</Text>
            <Text style={styles.storageValue}>{formatBytes(totalStorage)} for {downloadedTracks.length} tracks</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={downloadedTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <TouchableOpacity 
                style={[styles.trackItem, { backgroundColor }]}
                onPress={() => handlePlayTrack(item)}
                activeOpacity={0.7}
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

                <DownloadButton track={item} />
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: accentColor + '10' }]}>
              <Ionicons name="cloud-offline-outline" size={48} color={accentColor} />
            </View>
              <Text style={[styles.emptyText, { color: textColor }]}>
                No tracks downloaded
              </Text>
              <Text style={styles.emptySubText}>
                Your collection of offline tracks will appear here once you download them.
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
  storageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  storageIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(179, 74, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storageTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  storageValue: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(179, 74, 48, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
