import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

const LanguageItem = ({ label, isSelected, comingSoon, onPress }: any) => {
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  
  return (
    <TouchableOpacity 
      style={[
        styles.langItem, 
        { backgroundColor: surfaceColor },
        isSelected && styles.selectedItem
      ]} 
      onPress={onPress}
      disabled={comingSoon}
    >
      <View style={styles.langInfo}>
        <Text style={[
          styles.langLabel, 
          { color: textColor },
          comingSoon && { opacity: 0.5 }
        ]}>
          {label}
        </Text>
        {comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color="#B34A30" />
      )}
    </TouchableOpacity>
  );
};

export default function LanguageScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>App Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Select your preferred language for the app interface.
        </Text>

        <View style={styles.list}>
          <LanguageItem 
            label="English" 
            isSelected={true} 
            onPress={() => {}} 
          />
          <LanguageItem 
            label="Arabic (العربية)" 
            comingSoon={true} 
            onPress={() => {}} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 32,
    marginTop: 10,
  },
  list: {
    gap: 16,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedItem: {
    borderColor: "#B34A30",
  },
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
