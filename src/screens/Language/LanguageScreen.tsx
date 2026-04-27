import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { LanguageItem } from "../../components/language/LanguageItem";

export default function LanguageScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor(
    { light: "#94A3B8", dark: "#94A3B8" },
    "text",
  );

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
        <Text style={[styles.description, { color: mutedTextColor }]}>
          Select your preferred language for the app interface.
        </Text>

        <View style={styles.list}>
          <LanguageItem label="English" isSelected={true} onPress={() => {}} />
          <LanguageItem label="Arabic" comingSoon={true} onPress={() => {}} />
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
    marginBottom: 32,
    marginTop: 10,
  },
  list: {
    gap: 16,
  },
});
