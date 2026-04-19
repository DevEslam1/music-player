import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import LibraryScreen from "../screens/Library/LibraryScreen";
import NowPlayingScreen from "../screens/NowPlaying/NowPlayingScreen";
import PlaylistDetailScreen from "../screens/Playlist/PlaylistDetail";
import TermsScreen from "../screens/Legal/TermsScreen";
import DrawerNavigator from "./DrawerNavigator";
import { MiniPlayer } from "../components/MiniPlayer";

export type MainStack = {
  Login: undefined;
  SignUp: undefined;
  Library: undefined;
  NowPlaying: undefined;
  PlaylistDetail: { playlistId: string; name: string };
  TermsOfService: undefined;
  Drawer: undefined;
};

const Stack = createNativeStackNavigator<MainStack>();

interface AppNavigatorProps {
  currentRoute?: string;
}

const AppNavigator = ({ currentRoute }: AppNavigatorProps) => {

  const hideMiniPlayer = ["Login", "SignUp", "NowPlaying"].includes(currentRoute || "");

  return (
    <View style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="NowPlaying" component={NowPlayingScreen} />
        <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
        <Stack.Screen name="TermsOfService" component={TermsScreen} />
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
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
