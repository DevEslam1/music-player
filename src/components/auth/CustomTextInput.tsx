import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";

export type CustomTextInputProps = TextInputProps & {
  placeholder: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  value: string;
  onChangeText: ((text: string) => void) | undefined;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
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
  const accentColor = useAccentColor();
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor(
    { light: "#FAF5F4", dark: "rgba(255,255,255,0.05)" },
    "inputBackground",
  );

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {withGreenDt && <View style={styles.greenDot} />}
      </View>
      <View style={[
        styles.inputWrapper, 
        { 
          borderColor: accentColor,
          backgroundColor: surfaceColor,
        }
      ]}>
        <Ionicons
          name={iconName}
          size={20}
          color="#A0AEC0"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
          selectionColor={accentColor}
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
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
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
