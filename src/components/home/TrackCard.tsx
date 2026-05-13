import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAccentColor } from "../../hooks/use-theme-color";
import { Track } from "../../types";

const TrackCardInner = ({
  track,
  onPress,
  textColor,
}: {
  track: Track;
  onPress: () => void;
  textColor: string;
}) => {
  const accentColor = useAccentColor();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.imageContainer, { backgroundColor: accentColor + "10", borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', height: 150 }]}>
        <Ionicons name="musical-notes" size={40} color={accentColor} />
        {track.image && (
          <Image
            source={{ uri: track.image }}
            style={styles.cardImage}
            contentFit="cover"
          />
        )}
      </View>
      <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
        {track.name}
      </Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {track.artist}
      </Text>
    </TouchableOpacity>
  );
};

export const TrackCard = React.memo(TrackCardInner);

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginHorizontal: 8,
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
  },
  imageContainer: {
    position: 'relative',
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
