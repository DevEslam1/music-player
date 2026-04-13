import { Text, FlatList, StyleSheet, View } from "react-native";
import { Track } from "../../types";
import { TrackCard } from "./TrackCard";
import { Colors } from "../../constants/theme";

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
  return label ? (
    <View>
      {label && (
        <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
          {label}
        </Text>
      )}
      <FlatList
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        data={trackList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TrackCard
            track={item}
            textColor={Colors.light.text}
            onPress={() => handlePlayTrack(item, trackList)}
          />
        )}
      />
    </View>
  ) : (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={trackList}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TrackCard
          track={item}
          textColor={Colors.light.text}
          onPress={() => handlePlayTrack(item, trackList)}
        />
      )}
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
