import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/Home/HomeScreen";
import LikedSongsScreen from "../screens/LikedSongs/LikedSongsScreen";
import PlaylistScreen from "../screens/Playlist/PlaylistScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import FAQScreen from "../screens/FAQ/FAQScreen";
import { useThemeColor } from "../hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { CustomDrawerContent } from "../components/CustomDrawerContent";

export type drawerType = {
  Home: undefined;
  Playlist: undefined;
  LikedSongs: undefined;
  Profile: undefined;
  FAQ: undefined;
};

export type DrawerItemProps = {
  lightColor?: string;
  darkColor?: string;
};

const Drawer = createDrawerNavigator<drawerType>();

const DrawerNavigator = ({ lightColor, darkColor }: DrawerItemProps) => {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: backgroundColor,
            width: "75%",
          },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="LikedSongs" component={LikedSongsScreen} />
        <Drawer.Screen name="Playlist" component={PlaylistScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="FAQ" component={FAQScreen} />
      </Drawer.Navigator>
    </View>
  );
};

export default DrawerNavigator;
