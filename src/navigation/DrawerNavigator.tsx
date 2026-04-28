import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/Home/HomeScreen";
import LikedSongsScreen from "../screens/LikedSongs/LikedSongsScreen";
import PlaylistScreen from "../screens/Playlist/PlaylistScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import FAQScreen from "../screens/FAQ/FAQScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import ContactScreen from "../screens/Contact/ContactScreen";
import LanguageScreen from "../screens/Language/LanguageScreen";
import { useThemeColor } from "../hooks/use-theme-color";
import { CustomDrawerContent } from "../components/CustomDrawerContent";

import DownloadsScreen from "../screens/Downloads/DownloadsScreen";

export type drawerType = {
  Home: undefined;
  Playlist: undefined;
  LikedSongs: undefined;
  Downloads: undefined;
  Profile: undefined;
  FAQ: undefined;
  Settings: undefined;
  Contact: undefined;
  Language: undefined;
};

const Drawer = createDrawerNavigator<drawerType>();

const DrawerNavigator = () => {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Drawer.Navigator
      id="LeftDrawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.4)",
        drawerStyle: {
          backgroundColor: "transparent",
          width: "80%",
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="LikedSongs" component={LikedSongsScreen} />
      <Drawer.Screen name="Playlist" component={PlaylistScreen} />
      <Drawer.Screen name="Downloads" component={DownloadsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="FAQ" component={FAQScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
      <Drawer.Screen name="Language" component={LanguageScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
