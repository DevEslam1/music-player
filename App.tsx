import React, { useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./src/redux/store/store";
import { 
  NavigationContainer, 
  createNavigationContainerRef 
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export const navigationRef = createNavigationContainerRef();

function RootContent() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setCurrentRoute(navigationRef.getCurrentRoute()?.name);
      }}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;
        setCurrentRoute(currentRouteName);
      }}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} animated={true} />
      <AppNavigator currentRoute={currentRoute} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootContent />
      </SafeAreaProvider>
    </Provider>
  );
}
