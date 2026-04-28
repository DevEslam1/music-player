import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { DrawerContentComponentProps, useDrawerStatus } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { RootState } from "../redux/store/store";
import { toggleTheme } from "../redux/store/theme/themeSlice";
import { setDrawerOpen } from "../redux/store/ui/uiSlice";
import { fetchProfile } from "../redux/store/auth/authSlice";
import { useThemeColor, useAccentColor, useColorScheme, useBlurSettings } from "../hooks/use-theme-color";
import { BlurView } from "expo-blur";

interface DrawerItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  textColor: string;
  active?: boolean;
  isDarkMode?: boolean;
}

const DrawerItem = ({ icon, label, onPress, textColor, active, isDarkMode }: DrawerItemProps) => {
  const accentColor = useAccentColor();
  return (
    <TouchableOpacity 
      style={[
        styles.item, 
        active && { 
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", 
          borderColor: accentColor + '40',
          borderRadius: 16 
        }
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
          { color: active ? accentColor : textColor, fontWeight: active ? "800" : "600" }
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
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isDrawerOpen = useDrawerStatus() === 'open';
  
  React.useEffect(() => {
    dispatch(setDrawerOpen(isDrawerOpen));
    if (isDrawerOpen && isLoggedIn && !user?.name) {
      dispatch(fetchProfile() as any);
    }
  }, [isDrawerOpen, isLoggedIn, user?.name, dispatch]);
  
  const { advancedBlurEnabled, blurIntensity } = useBlurSettings();
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  
  const activeRoute = props.state.routes[props.state.index].name;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: advancedBlurEnabled ? "transparent" : backgroundColor,
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden'
      }
    ]}>
      {advancedBlurEnabled && (
        <BlurView 
          intensity={blurIntensity} 
          tint={isDarkMode ? "dark" : "light"} 
          style={[
            StyleSheet.absoluteFill,
            { 
              backgroundColor: isDarkMode ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.5)",
              borderTopRightRadius: 32,
              borderBottomRightRadius: 32,
            }
          ]}
        >
          {/* If a song is playing, show a hint of its colors behind the blur */}
          {currentTrack?.image && (
            <Image 
              source={{ uri: currentTrack.image }} 
              style={[StyleSheet.absoluteFill, { opacity: 0.25 }]}
              blurRadius={20}
            />
          )}
        </BlurView>
      )}
      
      {!advancedBlurEnabled && (
        <View style={[StyleSheet.absoluteFill, { 
          backgroundColor, 
          opacity: 0.95,
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
        }]} />
      )}
      
      <View style={{ flex: 1, paddingTop: 60 }}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={[styles.avatar, { backgroundColor: accentColor }]}
            onPress={() => props.navigation.navigate("Profile")}
          >
            <Ionicons name="person" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
              {user?.name || user?.email?.split('@')[0] || "User"}
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
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Home")} 
        />
        <DrawerItem 
          icon="search-outline" 
          label="Search" 
          textColor={textColor}
          active={activeRoute === "Library"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Library")} 
        />
        
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: textColor + '60' }]}>LIBRARY</Text>
        </View>

        <DrawerItem 
          icon="heart-outline" 
          label="Liked Songs" 
          textColor={textColor}
          active={activeRoute === "LikedSongs"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("LikedSongs")} 
        />
        <DrawerItem 
          icon="list-outline" 
          label="Playlists" 
          textColor={textColor}
          active={activeRoute === "Playlist"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Playlist")} 
        />
        <DrawerItem 
          icon="cloud-download-outline" 
          label="Downloads" 
          textColor={textColor}
          active={activeRoute === "Downloads"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Downloads")} 
        />
        
        <View style={[styles.divider, { backgroundColor: textColor + '20' }]} />

        <DrawerItem 
          icon="person-outline" 
          label="Profile" 
          textColor={textColor}
          active={activeRoute === "Profile"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Profile")} 
        />
        <DrawerItem 
          icon="globe-outline" 
          label="Language" 
          textColor={textColor}
          active={activeRoute === "Language"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Language")} 
        />
        <DrawerItem 
          icon="settings-outline" 
          label="Settings" 
          textColor={textColor}
          active={activeRoute === "Settings"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Settings")} 
        />
        
        <View style={[styles.divider, { backgroundColor: textColor + '20' }]} />
        
        <DrawerItem 
          icon="chatbubble-outline" 
          label="Contact us" 
          textColor={textColor}
          active={activeRoute === "Contact"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("Contact")} 
        />
        <DrawerItem 
          icon="bulb-outline" 
          label="FAQs" 
          textColor={textColor}
          active={activeRoute === "FAQ"}
          isDarkMode={isDarkMode}
          onPress={() => props.navigation.navigate("FAQ")} 
        />
      </ScrollView>
      
      <View style={styles.footer}>
         <Text style={[styles.footerText, { color: textColor + '40' }]}>GiG Player v2.1.0</Text>
      </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
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
  sectionHeader: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
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
    backgroundColor: "rgba(255,255,255,0.08)", // Glass etch look
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
