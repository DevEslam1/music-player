import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { toggleTheme, setAccentColor } from "../../redux/store/theme/themeSlice";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { ACCENT_COLORS } from "../../constants/theme";
import Constants from "expo-constants";
import { AppDispatch } from "../../redux/store/store";
import { SettingItem } from "../../components/settings/SettingItem";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const accentColor = useAccentColor();
  const appVersion = Constants.expoConfig?.version ?? "2.0.0";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.sectionTitle, { color: accentColor }]}>Appearance</Text>
          <SettingItem icon="moon-outline" label="Dark Mode">
            <Switch 
              value={isDarkMode} 
              onValueChange={() => { dispatch(toggleTheme()); }} 
              trackColor={{ false: "#CBD5E1", true: accentColor }}
            />
          </SettingItem>
          
          <View style={styles.colorPickerContainer}>
            <Text style={[styles.colorPickerLabel, { color: textColor }]}>Theme Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
              {ACCENT_COLORS.map((item) => (
                <TouchableOpacity
                  key={item.color}
                  onPress={() => dispatch(setAccentColor(item.color))}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: item.color },
                    accentColor === item.color && styles.activeColorCircle
                  ]}
                >
                  {accentColor === item.color && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <SettingItem 
            icon="globe-outline" 
            label="Language" 
            onPress={() => navigation.navigate("Language")}
          >
            <View style={styles.itemRight}>
              <Text style={styles.valueText}>English</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </SettingItem>
        </View>

        <View style={[styles.section, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.sectionTitle, { color: accentColor }]}>Support</Text>
          <SettingItem 
            icon="chatbubble-outline" 
            label="Contact Us" 
            onPress={() => navigation.navigate("Contact")}
          >
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </SettingItem>
          <SettingItem 
            icon="bulb-outline" 
            label="FAQs" 
            onPress={() => navigation.navigate("FAQ")}
          >
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </SettingItem>
        </View>

        <View style={[styles.section, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.sectionTitle, { color: accentColor }]}>About</Text>
          <SettingItem icon="information-circle-outline" label="Version">
            <Text style={styles.valueText}>{appVersion}</Text>
          </SettingItem>
          <SettingItem 
            icon="document-text-outline" 
            label="Terms of Service" 
            onPress={() => navigation.navigate("TermsOfService")}
          >
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </SettingItem>
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
  section: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1,
  },
  colorPickerContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  colorPickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: "row",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activeColorCircle: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 14,
    color: "#94A3B8",
    marginRight: 8,
  },
});
