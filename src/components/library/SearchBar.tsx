import { Ionicons } from "@expo/vector-icons";
import {
  View,
  TextInput,
  TouchableOpacity,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { RootState } from "../../redux/store/store";
import { useSelector } from "react-redux";

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
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const inputBg = useThemeColor({}, "inputBackground");
  const accentColor = useAccentColor();
  const placeholderColor = useSelector(
    (state: RootState) => state.theme.isDarkMode,
  )
    ? "#94A3B8"
    : "#A0AEC0";
  return (
    <View style={[styles.searchContainer, { backgroundColor: inputBg }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});
