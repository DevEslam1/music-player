import React, { useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { Provider, useSelector } from "react-redux";
import { AuthInitializer } from "./src/components/AuthInitializer";
import { store, RootState } from "./src/redux/store/store";
import { 
  NavigationContainer 
} from "@react-navigation/native";
import { navigationRef } from "./src/navigation/navigationUtils";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AppBootstrap } from "./src/components/AppBootstrap";

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
