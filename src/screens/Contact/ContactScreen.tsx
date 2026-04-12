import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

const ContactOption = ({ icon, title, subtitle, onPress }: any) => {
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  return (
    <TouchableOpacity 
      style={[styles.optionCard, { backgroundColor: surfaceColor }]} 
      onPress={onPress}
    >
      <View style={styles.optionIcon}>
        <Ionicons name={icon} size={28} color="#B34A30" />
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: textColor }]}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
};

export default function ContactScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const handleEmail = () => {
    Linking.openURL('mailto:karima.mahmoud.dev@gmail.com');
  };

  const handleGithub = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="code-slash-outline" size={50} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { color: textColor }]}>The Creators</Text>
          <Text style={styles.heroSubtitle}>GIG Music Player was developed with passion. Connect with the authors below.</Text>
        </View>

        <View style={styles.optionsSection}>
          <ContactOption 
            icon="logo-github" 
            title="Eslam" 
            subtitle="Principal Developer"
            onPress={() => handleGithub('https://github.com/DevEslam1')}
          />
          <ContactOption 
            icon="logo-github" 
            title="Karima Mahmoud" 
            subtitle="Developer & Designer"
            onPress={() => handleGithub('https://github.com/KarimaMahmoud626')}
          />
          <ContactOption 
            icon="mail-outline" 
            title="Email us" 
            subtitle="For inquiries and support"
            onPress={handleEmail}
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
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginVertical: 32,
  },
  heroIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#B34A30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#B34A30",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  optionsSection: {
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(179, 74, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
  },
  chatButton: {
    backgroundColor: "#B34A30",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#B34A30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
