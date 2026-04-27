import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";

interface SettingItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

function SettingItemInner({
  icon,
  label,
  children,
  onPress,
}: SettingItemProps) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={accentColor} style={styles.icon} />
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
}

export const SettingItem = React.memo(SettingItemInner);

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
    width: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
