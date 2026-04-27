import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

const SupportItem = ({ icon, title, subtitle, onPress }: any) => {
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const accentColor = useAccentColor();
  
  return (
    <TouchableOpacity 
      style={[styles.itemCard, { backgroundColor: surfaceColor }]} 
      onPress={onPress}
    >
      <View style={[styles.itemIcon, { backgroundColor: accentColor + '15' }]}>
        <Ionicons name={icon} size={24} color={accentColor} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemTitle, { color: textColor }]}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
};

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@musicplayer.com');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Support & Help</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={[styles.heroBadge, { backgroundColor: accentColor, shadowColor: accentColor }]}>
            <Ionicons name="headset" size={40} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { color: textColor }]}>How can we help?</Text>
          <Text style={styles.heroSubtitle}>Check our FAQs or get in touch with our team directly.</Text>
        </View>

        <View style={styles.section}>
          <SupportItem 
            icon="help-circle-outline" 
            title="FAQs" 
            subtitle="Quick answers to common questions"
            onPress={() => navigation.navigate('FAQ')}
          />
          <SupportItem 
            icon="mail-outline" 
            title="Contact Support" 
            subtitle="Get help via email"
            onPress={handleContactSupport}
          />
          <SupportItem 
            icon="people-outline" 
            title="Community" 
            subtitle="Join our user community"
            onPress={() => {}}
          />
          <SupportItem 
            icon="document-text-outline" 
            title="Legal" 
            subtitle="Terms of Service & Privacy"
            onPress={() => navigation.navigate('TermsOfService')}
          />
        </View>

        <TouchableOpacity style={[styles.liveChatButton, { backgroundColor: accentColor, shadowColor: accentColor }]}>
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.liveChatText}>Start Live Chat</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  heroBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  section: {
    marginBottom: 30,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
  },
  liveChatButton: {
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  liveChatText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
