import React from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { LocalFolder } from "../../types";

interface ExcludedFoldersModalProps {
  visible: boolean;
  onClose: () => void;
  folders: LocalFolder[];
  excludedFolders: string[];
  onToggleFolder: (folderPath: string) => void;
}

export function ExcludedFoldersModal({
  visible,
  onClose,
  folders,
  excludedFolders,
  onToggleFolder,
}: ExcludedFoldersModalProps) {
  const bg = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const excludedSet = new Set(excludedFolders);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Excluded Folders</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={28} color={textColor + "60"} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: textColor + "60" }]}>
            Disabled folders will be skipped during library scanning.
          </Text>

          {folders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={accentColor + "40"} />
              <Text style={[styles.emptyText, { color: textColor + "50" }]}>
                No folders found. Scan your library first.
              </Text>
            </View>
          ) : (
            <FlatList
              data={folders}
              keyExtractor={(item) => item.path}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => {
                const isExcluded = excludedSet.has(item.path);
                return (
                  <View style={[styles.folderRow, { backgroundColor: surfaceColor }]}>
                    <View style={[styles.folderIcon, { backgroundColor: accentColor + "12" }]}>
                      <Ionicons
                        name={isExcluded ? "folder-outline" : "folder"}
                        size={22}
                        color={isExcluded ? textColor + "30" : accentColor}
                      />
                    </View>
                    <View style={styles.folderInfo}>
                      <Text
                        style={[
                          styles.folderName,
                          { color: isExcluded ? textColor + "40" : textColor },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.folderMeta, { color: textColor + "40" }]} numberOfLines={1}>
                        {item.trackCount} song{item.trackCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <Switch
                      value={!isExcluded}
                      onValueChange={() => onToggleFolder(item.path)}
                      trackColor={{ false: "#CBD5E1", true: accentColor }}
                    />
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    maxHeight: "75%",
    minHeight: 300,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
  },
  folderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  folderMeta: {
    fontSize: 12,
  },
});
