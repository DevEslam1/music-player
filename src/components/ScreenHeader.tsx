import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/theme";

type ScreenHeaderProps = {
  screenTitle?: string;
};

export function ScreenHeader({ screenTitle }: ScreenHeaderProps) {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.headerButton}
      >
        <Ionicons name="arrow-back" size={26} color={Colors.light.text} />
      </TouchableOpacity>
      {screenTitle && (
        <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
          {screenTitle}
        </Text>
      )}
      <View style={styles.headerButton} />
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
