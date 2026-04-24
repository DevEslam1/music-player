import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import { logout, fetchProfile } from "../../redux/store/auth/authSlice";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { likedSongs, playlists } = useSelector((state: RootState) => state.library);

  React.useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  // Use a softer surface color based on the theme
  const cardBg = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
             <Ionicons name="person" size={50} color="#B34A30" />
          </View>
          <Text style={[styles.userName, { color: textColor }]}>{currentUser?.email?.split('@')[0] || "User Name"}</Text>
          <Text style={styles.userEmail}>{currentUser?.email || "user@example.com"}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{likedSongs.length}</Text>
            <Text style={styles.statLabel}>Liked Songs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{playlists.length}</Text>
            <Text style={styles.statLabel}>Playlists</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: cardBg }]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={textColor} />
            <Text style={[styles.menuText, { color: textColor }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: cardBg }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={textColor} />
            <Text style={[styles.menuText, { color: textColor }]}>Privacy & Safety</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: cardBg }]}
            onPress={() => navigation.navigate("Support")}
          >
            <Ionicons name="help-circle-outline" size={22} color={textColor} />
            <Text style={[styles.menuText, { color: textColor }]}>Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => dispatch(logout())}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
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
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    alignItems: "center",
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FAF0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#B34A30',
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#94A3B8",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 0.48,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#B34A30',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#B34A30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
