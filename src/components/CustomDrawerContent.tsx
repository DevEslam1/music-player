import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { toggleTheme } from "../redux/store/theme/themeSlice";
import { useThemeColor } from "../hooks/use-theme-color";

interface DrawerItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  textColor: string;
}

const DrawerItem = ({ icon, label, onPress, textColor }: DrawerItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Ionicons name={icon} size={24} color={textColor} style={styles.icon} />
    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Ionicons name="close-outline" size={30} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch(toggleTheme())}>
          <Ionicons 
            name={isDarkMode ? "sunny-outline" : "moon-outline"} 
            size={28} 
            color={textColor} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <DrawerItem 
          icon="home-outline" 
          label="Home" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Home")} 
        />
        <DrawerItem 
          icon="person-outline" 
          label="Profile" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Profile")} 
        />
        <DrawerItem 
          icon="search-outline" 
          label="Library" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Library")} 
        />
        <DrawerItem 
          icon="heart-outline" 
          label="Liked Songs" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("LikedSongs")} 
        />
        <DrawerItem 
          icon="list-outline" 
          label="Playlists" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Playlist")} 
        />
        <DrawerItem 
          icon="cloud-download-outline" 
          label="Downloads" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Downloads")} 
        />
        
        <View style={[styles.divider, { backgroundColor: textColor + '10' }]} />

        <DrawerItem 
          icon="globe-outline" 
          label="Language" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Language")} 
        />
        <DrawerItem 
          icon="chatbubble-outline" 
          label="Contact us" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Contact")} 
        />
        <DrawerItem 
          icon="bulb-outline" 
          label="FAQs" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("FAQ")} 
        />
        <DrawerItem 
          icon="settings-outline" 
          label="Settings" 
          textColor={textColor}
          onPress={() => props.navigation.navigate("Settings")} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  content: {
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  icon: {
    marginRight: 20,
    width: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 15,
    marginHorizontal: 15,
  },
});
