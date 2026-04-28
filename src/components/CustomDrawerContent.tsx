import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { DrawerContentComponentProps, useDrawerStatus } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { toggleTheme } from "../redux/store/theme/themeSlice";
import { setDrawerOpen } from "../redux/store/ui/uiSlice";
import { useThemeColor, useAccentColor, useColorScheme } from "../hooks/use-theme-color";
import { BlurView } from "expo-blur";

interface DrawerItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  textColor: string;
  active?: boolean;
}

const DrawerItem = ({ icon, label, onPress, textColor, active }: DrawerItemProps) => {
  const accentColor = useAccentColor();
  return (
    <TouchableOpacity 
      style={[
        styles.item, 
        active && { backgroundColor: accentColor + '20', borderRadius: 12 }
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={active ? accentColor : textColor} 
        style={styles.icon} 
      />
      <Text 
        style={[
          styles.label, 
          { color: active ? accentColor : textColor, fontWeight: active ? "700" : "500" }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const user = useSelector((state: RootState) => state.auth.currentUser);
  const isDrawerOpen = useDrawerStatus() === 'open';
  
  React.useEffect(() => {
    dispatch(setDrawerOpen(isDrawerOpen));
  }, [isDrawerOpen, dispatch]);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  
  const activeRoute = props.state.routes[props.state.index].name;

  return (
    <BlurView 
      intensity={isDarkMode ? 45 : 85} 
      tint={isDarkMode ? "dark" : "light"} 
      style={[
        styles.container, 
        { backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)" }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={[styles.avatar, { backgroundColor: accentColor }]}
            onPress={() => props.navigation.navigate("Profile")}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
              {user?.name || "Music Lover"}
            </Text>
            <View style={[styles.badge, { backgroundColor: accentColor + '30' }]}>
              <Text style={[styles.userStatus, { color: accentColor }]}>PREMIUM</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => dispatch(toggleTheme())} 
          style={[styles.themeToggle, { backgroundColor: textColor + '10' }]}
        >
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={22} 
            color={textColor} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }} 
        showsVerticalScrollIndicator={false}
      >
        <DrawerItem 
          icon="home-outline" 
          label="Home" 
          textColor={textColor}
          active={activeRoute === "Home"}
          onPress={() => props.navigation.navigate("Home")} 
        />
        <DrawerItem 
          icon="search-outline" 
          label="Library" 
          textColor={textColor}
          active={activeRoute === "Library"}
          onPress={() => props.navigation.navigate("Library")} 
        />
        <DrawerItem 
          icon="heart-outline" 
          label="Liked Songs" 
          textColor={textColor}
          active={activeRoute === "LikedSongs"}
          onPress={() => props.navigation.navigate("LikedSongs")} 
        />
        <DrawerItem 
          icon="list-outline" 
          label="Playlists" 
          textColor={textColor}
          active={activeRoute === "Playlist"}
          onPress={() => props.navigation.navigate("Playlist")} 
        />
        <DrawerItem 
          icon="cloud-download-outline" 
          label="Downloads" 
          textColor={textColor}
          active={activeRoute === "Downloads"}
          onPress={() => props.navigation.navigate("Downloads")} 
        />
        
        <View style={[styles.divider, { backgroundColor: textColor + '20' }]} />

        <DrawerItem 
          icon="person-outline" 
          label="Profile" 
          textColor={textColor}
          active={activeRoute === "Profile"}
          onPress={() => props.navigation.navigate("Profile")} 
        />
        <DrawerItem 
          icon="globe-outline" 
          label="Language" 
          textColor={textColor}
          active={activeRoute === "Language"}
          onPress={() => props.navigation.navigate("Language")} 
        />
        <DrawerItem 
          icon="settings-outline" 
          label="Settings" 
          textColor={textColor}
          active={activeRoute === "Settings"}
          onPress={() => props.navigation.navigate("Settings")} 
        />
        
        <View style={[styles.divider, { backgroundColor: textColor + '20' }]} />
        
        <DrawerItem 
          icon="chatbubble-outline" 
          label="Contact us" 
          textColor={textColor}
          active={activeRoute === "Contact"}
          onPress={() => props.navigation.navigate("Contact")} 
        />
        <DrawerItem 
          icon="bulb-outline" 
          label="FAQs" 
          textColor={textColor}
          active={activeRoute === "FAQ"}
          onPress={() => props.navigation.navigate("FAQ")} 
        />
      </ScrollView>
      
      <View style={styles.footer}>
         <Text style={[styles.footerText, { color: textColor + '40' }]}>GiG Player v2.1.0</Text>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    justifyContent: "center",
    flex: 1,
    paddingRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  userStatus: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
  },
  icon: {
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 25,
    opacity: 0.5,
  },
  footer: {
    paddingVertical: 25,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
