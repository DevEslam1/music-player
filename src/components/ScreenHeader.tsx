import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useThemeColor, useAccentColor, useColorScheme, useBlurSettings } from "../hooks/use-theme-color";
import { MainStack } from "../navigation/AppNavigator";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenHeaderProps = {
  screenTitle?: string;
  postIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onPostPress?: ((event: GestureResponderEvent) => void) | undefined;
  rightComponent?: React.ReactNode;
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onBack?: () => void;
};

export function ScreenHeader({
  screenTitle,
  postIcon,
  onPostPress,
  rightComponent,
  leftIcon = "arrow-back",
  onBack,
}: ScreenHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const { advancedBlurEnabled, blurIntensity } = useBlurSettings();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {advancedBlurEnabled ? (
        <BlurView
          intensity={blurIntensity * 0.6} // Headers look better with slightly less intensity than sliders
          tint={isDarkMode ? "dark" : "light"}
          style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)",
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            }
          ]}
        >
          {headerContent(leftIcon, onBack, navigation, screenTitle, textColor, rightComponent, postIcon, onPostPress, accentColor)}
        </BlurView>
      ) : (
        <View style={[styles.header, { backgroundColor: isDarkMode ? "rgba(30, 41, 59, 1)" : "rgba(255, 255, 255, 1)" }]}>
          {headerContent(leftIcon, onBack, navigation, screenTitle, textColor, rightComponent, postIcon, onPostPress, accentColor)}
        </View>
      )}
    </View>
  );
}

function headerContent(leftIcon: any, onBack: any, navigation: any, screenTitle: any, textColor: any, rightComponent: any, postIcon: any, onPostPress: any, accentColor: any) {
  return (
    <>
      <TouchableOpacity
        onPress={() => (onBack ? onBack() : navigation.goBack())}
        style={styles.headerButton}
      >
        <Ionicons name={leftIcon} size={26} color={textColor} />
      </TouchableOpacity>
      {screenTitle && (
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {screenTitle}
        </Text>
      )}
      {rightComponent ? rightComponent : postIcon ? (
        <TouchableOpacity onPress={onPostPress} style={styles.headerButton}>
          <Ionicons name={postIcon} size={26} color={accentColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
    borderRadius: 20,
    marginHorizontal: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
    letterSpacing: -0.5,
  },
});
