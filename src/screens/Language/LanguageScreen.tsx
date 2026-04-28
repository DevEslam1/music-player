import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { LanguageItem } from "../../components/language/LanguageItem";

export default function LanguageScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor(
    { light: "#94A3B8", dark: "#94A3B8" },
    "text",
  );
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScreenHeader screenTitle="App Language" />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 85 }]}>
        <Text style={[styles.description, { color: mutedTextColor }]}>
          Select your preferred language for the app interface.
        </Text>

        <View style={styles.list}>
          <LanguageItem label="English" isSelected={true} onPress={() => {}} />
          <LanguageItem label="Arabic" comingSoon={true} onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
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
