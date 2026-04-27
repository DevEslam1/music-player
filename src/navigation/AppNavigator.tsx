import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import LibraryScreen from "../screens/Library/LibraryScreen";
import NowPlayingScreen from "../screens/NowPlaying/NowPlayingScreen";
import PlaylistDetailScreen from "../screens/Playlist/PlaylistDetail";
import TracksListScreen from "../screens/Home/TracksListScreen";
import TermsScreen from "../screens/Legal/TermsScreen";
import DrawerNavigator from "./DrawerNavigator";
import { WelcomeScreen } from "../screens/Auth";
import { MiniPlayer } from "../components/MiniPlayer";
import NotificationsScreen from "../screens/Notifications/NotificationsScreen";
import SupportScreen from "../screens/Support/SupportScreen";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Track } from "../types";

export type MainStack = {
  Login: undefined;
  SignUp: undefined;
  Library: undefined;
  NowPlaying: undefined;
  PlaylistDetail: { playlistId: string; name: string };
  TracksList: { title: string; tracks: Track[]; query?: string };
  TermsOfService: undefined;
  Drawer: undefined;
  Welcome: undefined;
  Notifications: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<MainStack>();

interface AppNavigatorProps {
  currentRoute?: string;
}

const AppNavigator = ({ currentRoute }: AppNavigatorProps) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const isDrawerOpen = useSelector((state: RootState) => state.ui.isDrawerOpen);
  // Hide miniplayer during auth, now playing, or when route is not yet determined
  const hideMiniPlayer = isDrawerOpen || !currentRoute || ["Login", "SignUp", "NowPlaying", "Welcome"].includes(currentRoute);
  const isFirstLaunch = useSelector((state: RootState) => state.auth.isFirstLaunch);

  // Fix 6: Determine initial route but always register all screens unconditionally.
  // This prevents "screen does not exist" errors during auth state transitions.
  const initialRouteName = isFirstLaunch ? "Welcome" : (isLoggedIn ? "Drawer" : "Login");

  return (
    <View style={styles.container}>
      <Stack.Navigator 
        id="MainStack" 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        {/* Auth screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        {/* Main app screens */}
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="NowPlaying" component={NowPlayingScreen} />
        <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
        <Stack.Screen name="TracksList" component={TracksListScreen} />
        <Stack.Screen name="TermsOfService" component={TermsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
      </Stack.Navigator>
      {!hideMiniPlayer && <MiniPlayer />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
