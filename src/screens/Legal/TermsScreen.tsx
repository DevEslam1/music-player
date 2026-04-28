import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useBlurSettings } from "../../hooks/use-theme-color";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function TermsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScreenHeader 
        screenTitle="Terms of Service" 
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 85 }]}>
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.title, { color: textColor }]}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By using GiG Player, you agree to these terms. If you do not agree, please do not use the app.
          </Text>

          <Text style={[styles.title, { color: textColor }]}>2. User Account</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account and password. All your music data is synced to your account.
          </Text>

          <Text style={[styles.title, { color: textColor }]}>3. Cloud Content</Text>
          <Text style={styles.text}>
            GiG Player provides streaming services. Users are responsible for their network data consumption while streaming.
          </Text>

          <Text style={[styles.title, { color: textColor }]}>4. Intellectual Property</Text>
          <Text style={styles.text}>
            All music content is provided by authorized partners. Re-distribution or unauthorized downloading is strictly prohibited.
          </Text>

          <Text style={[styles.title, { color: textColor }]}>5. Modifications</Text>
          <Text style={styles.text}>
            We reserve the right to modify these terms at any time. Changes will be notified through the app update log.
          </Text>
        </View>

        <Text style={styles.footer}>Last Updated: April 2026</Text>
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
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    marginTop: 20,
  },
});
