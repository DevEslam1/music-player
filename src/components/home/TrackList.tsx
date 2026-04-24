import React, { useCallback } from "react";
import { Text, FlatList, StyleSheet, View } from "react-native";
import { Track } from "../../types";
import { TrackCard } from "./TrackCard";
import { useThemeColor } from "../../hooks/use-theme-color";

type TrackListProps = {
  label?: string;
  trackList: Track[];
  handlePlayTrack: (track: Track, queue: Track[]) => Promise<void>;
  horizontal?: boolean;
};

export function TrackList({
  label,
  trackList,
  handlePlayTrack,
  horizontal = true,
}: TrackListProps) {
  const textColor = useThemeColor({}, "text");

  // Memoize renderItem to prevent recreation on every parent re-render
  const renderItem = useCallback(
    ({ item }: { item: Track }) => (
      <TrackCard
        track={item}
        textColor={textColor}
        onPress={() => handlePlayTrack(item, trackList)}
      />
    ),
    [textColor, trackList, handlePlayTrack]
  );

  const flatListPerformanceProps = {
    removeClippedSubviews: true,  // Don't render off-screen items (low-end wins)
    maxToRenderPerBatch: 5,       // Render 5 items per JS frame
    windowSize: 5,                // Keep 5 screens worth of items in memory
    initialNumToRender: 4,        // Fast first paint
    updateCellsBatchingPeriod: 50, // Batch updates every 50ms
  };

  return label ? (
    <View>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{label}</Text>
      <FlatList
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        data={trackList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
        {...flatListPerformanceProps}
      />
    </View>
  ) : (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={trackList}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={renderItem}
      {...flatListPerformanceProps}
    />
  );
}

const styles = StyleSheet.create({
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
});
