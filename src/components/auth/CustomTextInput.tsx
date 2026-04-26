import {
  View,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type CustomTextInputProps = TextInputProps & {
  placeholder: string;
  keyboardType?: string;
  autoCapitalize?: string;
  value: string;
  onChangeText: ((text: string) => void) | undefined;
  iconName: any;
  withGreenDt?: boolean;
  secureEntry?: boolean;
  label: string;
};

export function CustomTextInput({
  label,
  placeholder,
  keyboardType,
  autoCapitalize,
  value,
  iconName,
  withGreenDt = false,
  secureEntry = false,
  onChangeText,
}: CustomTextInputProps) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {withGreenDt && <View style={styles.greenDot} />}
      </View>
      <View style={styles.inputWrapper}>
        <Ionicons
          name={iconName}
          size={20}
          color="#A0AEC0"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B34A30",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: "#FAF5F4", 
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },
  greenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4ADE80",
    marginLeft: 4,
    marginBottom: 8,
  },
});
