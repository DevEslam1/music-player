import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";

interface EmptyFavoriteProps {
  onPress: () => void;
}

export const EmptyFavorite = React.memo(({ onPress }: EmptyFavoriteProps) => {
  const accentColor = useAccentColor();
  const mutedTextColor = useThemeColor(
    { light: "#94A3B8", dark: "#94A3B8" },
    "text",
  );

  return (
    <TouchableOpacity
      style={[
        styles.emptyFavorite,
        {
          backgroundColor: `${accentColor}0D`,
          borderColor: accentColor,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name="heart-outline" size={24} color={accentColor} />
      <Text style={[styles.emptyFavoriteText, { color: mutedTextColor }]}>
        Tap heart on a song to see it here
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  emptyFavorite: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyFavoriteText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
