import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
  currentEndAt: number | null;
  onSelectTime: (minutes: number | null) => void;
}

export function SleepTimerModal({ visible, onClose, currentEndAt, onSelectTime }: SleepTimerModalProps) {
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const options = [
    { label: "Off", value: null },
    { label: "15 Minutes", value: 15 },
    { label: "30 Minutes", value: 30 },
    { label: "45 Minutes", value: 45 },
    { label: "60 Minutes", value: 60 },
    { label: "90 Minutes", value: 90 },
    { label: "120 Minutes", value: 120 },
  ];

  // Estimate remaining minutes if active
  let remainingMinutes: number | null = null;
  if (currentEndAt) {
    const diff = currentEndAt - Date.now();
    if (diff > 0) {
      remainingMinutes = Math.ceil(diff / 60000);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>Sleep Timer</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
              
              {remainingMinutes !== null && (
                <View style={[styles.activeInfo, { backgroundColor: accentColor + "20" }]}>
                  <Ionicons name="timer-outline" size={20} color={accentColor} />
                  <Text style={[styles.activeText, { color: accentColor }]}>
                    Stops in ~{remainingMinutes} min
                  </Text>
                </View>
              )}

              <ScrollView style={styles.optionsList}>
                {options.map((opt, i) => {
                  const isSelected = opt.value === null && !currentEndAt;
                  return (
                    <TouchableOpacity 
                      key={i} 
                      style={[styles.optionItem, { borderBottomColor: textColor + "15" }]}
                      onPress={() => {
                        onSelectTime(opt.value);
                        onClose();
                      }}
                    >
                      <Text style={[styles.optionText, { color: textColor }]}>{opt.label}</Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={24} color={accentColor} />
                      )}
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  activeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  activeText: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  optionsList: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
  },
});
