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
    removeClippedSubviews: true,  
    maxToRenderPerBatch: 5,       
    windowSize: 5,                
    initialNumToRender: 4,        
    updateCellsBatchingPeriod: 50, 
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
