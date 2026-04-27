import React from "react";
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";
import { Track } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { DownloadButton } from "../DownloadButton";

type SearchItemProps = {
  onPlayTrack?: ((event: GestureResponderEvent) => void) | undefined;
  onOpenPicker?: ((event: GestureResponderEvent) => void) | undefined;
  item: Track;
  isLiked?: boolean;
};

const SearchItemInner = ({
  item,
  onPlayTrack,
  onOpenPicker,
  isLiked = false,
}: SearchItemProps) => {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  return (
    <TouchableOpacity style={styles.card} onPress={onPlayTrack}>
      <Image
        source={{ uri: item.image || "https://picsum.photos/200" }}
        style={styles.cardImage}
        resizeMethod="resize"
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardTitle, { color: textColor }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.artistRow}>
          {isLiked && (
            <Ionicons
              name="heart"
              size={14}
              color={accentColor}
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <DownloadButton track={item} size={22} />
        <TouchableOpacity onPress={onOpenPicker} style={styles.actionBtn}>
          <Ionicons name="add-circle-outline" size={26} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPlayTrack}>
          <Ionicons name="play-circle-outline" size={32} color={accentColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const SearchItem = React.memo(SearchItemInner);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  artistRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    marginRight: 12,
  },
});
