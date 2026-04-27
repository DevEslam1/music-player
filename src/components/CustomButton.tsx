import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAccentColor } from "../hooks/use-theme-color";

export type CustomButtonProps = {
  onPress: () => void;
  isDisabled?: boolean;
  label: string;
  loading?: boolean;
};

export function CustomButton({
  onPress,
  isDisabled,
  label,
  loading = false,
}: CustomButtonProps) {
  const accentColor = useAccentColor();

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor: accentColor, shadowColor: accentColor },
        (isDisabled || loading) && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          <Text style={styles.buttonText}>{label}</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFF"
            style={{ marginLeft: 8 }}
          />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
