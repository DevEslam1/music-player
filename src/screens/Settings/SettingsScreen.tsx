import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { toggleTheme, setAccentColor, setThemeMode } from "../../redux/store/theme/themeSlice";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { ACCENT_COLORS } from "../../constants/theme";
import Constants from "expo-constants";
import { AppDispatch } from "../../redux/store/store";
import { SettingItem } from "../../components/settings/SettingItem";
import { ScreenHeader } from "../../components/ScreenHeader";
import { saveThemePreferences } from "../../services/storage/themePreferences";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { isDarkMode, themeMode } = useSelector((state: RootState) => state.theme);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const accentColor = useAccentColor();
  const appVersion = Constants.expoConfig?.version ?? "2.1.0";

  const handleUpdateThemeMode = (mode: "light" | "dark" | "system") => {
    dispatch(setThemeMode(mode));
    saveThemePreferences({ 
      themeMode: mode, 
      isDarkMode: mode === "dark", 
      accentColor 
    });
  };

  const handleUpdateAccentColor = (color: string) => {
    dispatch(setAccentColor(color));
    saveThemePreferences({ themeMode, isDarkMode, accentColor: color });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        screenTitle="Settings"
        leftIcon="menu"
        onBack={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.sectionTitle, { color: accentColor }]}>Appearance</Text>
          
          <View style={styles.themeSelector}>
            {[
              { label: "Light", value: "light", icon: "sunny-outline" },
              { label: "Dark", value: "dark", icon: "moon-outline" },
              { label: "Auto", value: "system", icon: "sync-outline" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleUpdateThemeMode(option.value as any)}
                style={[
                  styles.themeOption,
                  { backgroundColor: themeMode === option.value ? accentColor : "rgba(148, 163, 184, 0.1)" }
                ]}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={themeMode === option.value ? "#FFF" : textColor} 
                />
                <Text 
                  style={[
                    styles.themeLabel, 
                    { color: themeMode === option.value ? "#FFF" : textColor }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.colorPickerContainer}>
            <Text style={[styles.colorPickerLabel, { color: textColor }]}>Theme Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
              {ACCENT_COLORS.map((item) => (
                <TouchableOpacity
                  key={item.color}
                  onPress={() => handleUpdateAccentColor(item.color)}
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
          <Text style={[styles.sectionTitle, { color: accentColor }]}>Storage & Downloads</Text>
          <SettingItem icon="cloud-download-outline" label="Auto-Download Favorites">
            <Switch 
              value={useSelector((state: any) => state.downloads.autoDownloadEnabled)} 
              onValueChange={(val) => { dispatch({ type: "downloads/setAutoDownloadEnabled", payload: val }); }} 
              trackColor={{ false: "#CBD5E1", true: accentColor }}
            />
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
  themeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
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
