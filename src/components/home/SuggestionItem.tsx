import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { Track } from "../../types";
import { Ionicons } from "@expo/vector-icons";

const SuggestionItemInner = ({
  track,
  onPress,
  textColor,
}: {
  track: Track;
  onPress: () => void;
  textColor: string;
}) => {
  return (
    <TouchableOpacity style={styles.suggestionItem} onPress={onPress}>
      <Image
        source={{ uri: track.image || "https://picsum.photos/200" }}
        style={styles.suggestionImage}
        resizeMethod="resize"
        resizeMode="cover"
      />
      <View style={styles.suggestionInfo}>
        <Text
          style={[styles.suggestionTitle, { color: textColor }]}
          numberOfLines={1}
        >
          {track.name}
        </Text>
        <Text style={styles.suggestionArtist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <Ionicons name="play-circle-outline" size={28} color="#B34A30" />
    </TouchableOpacity>
  );
};

export const SuggestionItem = React.memo(SuggestionItemInner);

const styles = StyleSheet.create({
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.3)", 
  },
  suggestionImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  suggestionArtist: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
