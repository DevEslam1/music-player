import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { Track } from "../../types";

export function TrackCard({
  track,
  onPress,
  textColor,
}: {
  track: Track;
  onPress: () => void;
  textColor: string;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: track.image || "https://picsum.photos/200" }}
        style={styles.cardImage}
      />
      <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
        {track.name}
      </Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {track.artist}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginHorizontal: 8,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
  },
});
