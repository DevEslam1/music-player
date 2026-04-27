import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

const NotificationItem = ({ title, body, time, icon, color }: any) => {
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  
  return (
    <TouchableOpacity style={[styles.notificationCard, { backgroundColor: surfaceColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: textColor }]}>{title}</Text>
          <Text style={styles.notificationTime}>{time}</Text>
        </View>
        <Text style={styles.notificationBody}>{body}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
        <TouchableOpacity style={styles.clearBtn}>
          <Text style={[styles.clearText, { color: accentColor }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Recent</Text>
        
        <NotificationItem 
          title="New Album Release" 
          body="Amr Diab just released his new album 'Makanak'. Listen now!"
          time="2h ago"
          icon="musical-notes"
          color={accentColor}
        />

        <NotificationItem 
          title="Playlist Update" 
          body="Your 'Chill Vibes' playlist has been updated with new tracks."
          time="5h ago"
          icon="list"
          color="#10B981"
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Earlier</Text>

        <NotificationItem 
          title="System Maintenance" 
          body="The app will be briefely unavailable tonight for scheduled maintenance."
          time="Yesterday"
          icon="settings"
          color="#6366F1"
        />
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
  clearBtn: {
    padding: 8,
  },
  clearText: {
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
  notificationBody: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
});
