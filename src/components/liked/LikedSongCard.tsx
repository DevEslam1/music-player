import { Ionicons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";
import { Track } from "../../types";
import { useThemeColor } from "../../hooks/use-theme-color";

type LikedSongCardProps = {
  item: Track;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  editMode?: boolean;
  onRemove?: ((event: GestureResponderEvent) => void) | undefined;
};

export function LikedSongCard({
  item,
  onPress,
  editMode,
  onRemove,
}: LikedSongCardProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <TouchableOpacity
      style={[styles.card, editMode && styles.cardEdit]}
      onPress={onPress}
      activeOpacity={editMode ? 1 : 0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || "https://picsum.photos/200" }}
          style={styles.cardImage}
        />
        {editMode && (
          <TouchableOpacity style={styles.removeBadge} onPress={onRemove}>
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {item.artist}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
  },
  cardEdit: {
    opacity: 0.9,
  },
  imageContainer: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  removeBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
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
});
