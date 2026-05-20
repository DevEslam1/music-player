import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { LanguageItem } from "../../components/language/LanguageItem";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store/store";
import { showBanner } from "../../redux/store/ui/uiSlice";

export default function LanguageScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor(
    { light: "#94A3B8", dark: "#94A3B8" },
    "text",
  );
  const insets = useSafeAreaInsets();

  const handleEnglish = () => {
    dispatch(showBanner({ message: "Language set to English successfully.", type: "success" }));
  };

  const handleArabic = () => {
    dispatch(showBanner({ message: "Arabic translation is coming soon in the next release!", type: "info" }));
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScreenHeader screenTitle="App Language" />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 85 }]}>
        <Text style={[styles.description, { color: mutedTextColor }]}>
          Select your preferred language for the app interface.
        </Text>

        <View style={styles.list}>
          <LanguageItem label="English" isSelected={true} onPress={handleEnglish} />
          <LanguageItem label="Arabic" comingSoon={true} onPress={handleArabic} />
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
