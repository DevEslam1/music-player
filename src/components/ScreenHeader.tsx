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
import { useThemeColor, useAccentColor } from "../hooks/use-theme-color";
import { MainStack } from "../navigation/AppNavigator";

type ScreenHeaderProps = {
  screenTitle?: string;
  postIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onPostPress?: ((event: GestureResponderEvent) => void) | undefined;
};

export function ScreenHeader({
  screenTitle,
  postIcon,
  onPostPress,
}: ScreenHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.headerButton}
      >
        <Ionicons name="arrow-back" size={26} color={textColor} />
      </TouchableOpacity>
      {screenTitle && (
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {screenTitle}
        </Text>
      )}
      {postIcon ? (
        <TouchableOpacity onPress={onPostPress} style={styles.headerButton}>
          <Ionicons name={postIcon} size={26} color={accentColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerButton: {
    padding: 4,
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
