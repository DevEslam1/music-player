import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { toggleTheme } from "../../redux/store/theme/themeSlice";
import { useThemeColor } from "../../hooks/use-theme-color";

const SettingItem = ({ icon, label, children, onPress }: any) => {
  const textColor = useThemeColor({}, "text");
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color="#B34A30" style={styles.icon} />
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");

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
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem icon="moon-outline" label="Dark Mode">
            <Switch 
              value={isDarkMode} 
              onValueChange={() => { dispatch(toggleTheme()); }} 
              trackColor={{ false: "#CBD5E1", true: "#B34A30" }}
            />
          </SettingItem>
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
          <Text style={styles.sectionTitle}>Support</Text>
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
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem icon="information-circle-outline" label="Version">
            <Text style={styles.valueText}>1.0.0</Text>
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
    color: "#B34A30",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1,
  },
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
