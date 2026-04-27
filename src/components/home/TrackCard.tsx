import React from "react";
import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import { Track } from "../../types";
import { DownloadButton } from "../DownloadButton";

const TrackCardInner = ({
  track,
  onPress,
  textColor,
}: {
  track: Track;
  onPress: () => void;
  textColor: string;
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: track.image || "https://picsum.photos/200" }}
          style={styles.cardImage}
          resizeMethod="resize"
          resizeMode="cover"
        />
        <View style={styles.downloadOverlay}>
          <DownloadButton track={track} size={20} color="#FFF" />
        </View>
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
  downloadOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
    padding: 4,
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
