import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";

interface LanguageItemProps {
  label: string;
  isSelected?: boolean;
  comingSoon?: boolean;
  onPress: () => void;
}

function LanguageItemInner({
  label,
  isSelected = false,
  comingSoon = false,
  onPress,
}: LanguageItemProps) {
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const accentColor = useAccentColor();

  return (
    <TouchableOpacity
      style={[
        styles.langItem,
        { backgroundColor: surfaceColor },
        isSelected && [styles.selectedItem, { borderColor: accentColor }],
      ]}
      onPress={onPress}
      disabled={comingSoon}
    >
      <View style={styles.langInfo}>
        <Text
          style={[
            styles.langLabel,
            { color: textColor },
            comingSoon && { opacity: 0.5 },
          ]}
        >
          {label}
        </Text>
        {comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={accentColor} />
      )}
    </TouchableOpacity>
  );
}

export const LanguageItem = React.memo(LanguageItemInner);

const styles = StyleSheet.create({
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedItem: {},
  langInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  comingSoonBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
