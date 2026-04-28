import { Ionicons } from "@expo/vector-icons";
import {
  View,
  TextInput,
  TouchableOpacity,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";
import { useThemeColor, useBlurSettings } from "../../hooks/use-theme-color";
import { RootState } from "../../redux/store/store";
import { useSelector } from "react-redux";
import { BlurView } from "expo-blur";

type SearchBarProps = {
  onChangeText?: ((text: string) => void) | undefined;
  query: string;
  onSearchPress: ((event: GestureResponderEvent) => void) | undefined;
};

import { useAccentColor } from "../../hooks/use-theme-color";

export function SearchBar({
  query,
  onChangeText,
  onSearchPress,
}: SearchBarProps) {
  const { advancedBlurEnabled, blurIntensity } = useBlurSettings();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const inputBg = useThemeColor({}, "inputBackground");
  const accentColor = useAccentColor();
  const placeholderColor = useSelector(
    (state: RootState) => state.theme.isDarkMode,
  )
    ? "#94A3B8"
    : "#A0AEC0";
  return (
    <View style={styles.searchContainer}>
      <BlurView
        intensity={advancedBlurEnabled ? blurIntensity : 0}
        tint={isDarkMode ? "dark" : "light"}
        style={[
          styles.blurBackground,
          { 
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            borderColor: textColor + '15'
          }
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={placeholderColor}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search songs, artists..."
          placeholderTextColor={placeholderColor}
          value={query}
          onChangeText={onChangeText}
          autoFocus={true}
          selectionColor={accentColor}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onSearchPress}>
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    height: 56,
  },
  blurBackground: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});
