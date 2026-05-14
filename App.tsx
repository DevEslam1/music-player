import React, { useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { Provider } from "react-redux";
import { AuthInitializer } from "./src/components/AuthInitializer";
import { store } from "./src/redux/store/store";
import { 
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { navigationRef } from "./src/navigation/navigationUtils";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AppBootstrap } from "./src/components/AppBootstrap";

import { useColorScheme } from "./src/hooks/use-theme-color";
import { Colors } from "./src/constants/theme";

function RootContent() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();
  const colorScheme = useColorScheme();

  const navigationTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: Colors[colorScheme].background,
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={() => {
        setCurrentRoute(navigationRef.getCurrentRoute()?.name);
      }}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;
        setCurrentRoute(currentRouteName);
      }}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} animated={true} />
      <AppNavigator currentRoute={currentRoute} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppBootstrap>
            <AuthInitializer>
              <OfflineBanner />
              <ErrorBoundary>
                <RootContent />
              </ErrorBoundary>
            </AuthInitializer>
          </AppBootstrap>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
