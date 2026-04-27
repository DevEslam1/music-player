import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CustomTextInput } from "../../components/auth/CustomTextInput";
import { CustomButton } from "../../components/CustomButton";
import { signUpScreenLogic } from "../../services/logic/signUpScreenLogic";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";

// Slicing components for cleaner code!
import { AuthHeader } from "../../components/auth/AuthHeader";

/**
 * Junior Refactor:
 * Now using the shared AuthHeader!
 * Slicing screens into smaller parts makes our app more professional.
 */

export default function SignUpScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    loading,
    isFormValid,
    handleSignUp,
  } = signUpScreenLogic();

  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const accentColor = useAccentColor();
  const mutedTextColor = useThemeColor(
    { light: "#64748B", dark: "#94A3B8" },
    "text",
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 1. Shared Auth Header with Back Button */}
      <AuthHeader 
        title="Create Account" 
        subtitle="Join our music community" 
        showBackButton={true}
      />

      <View style={styles.card}>
        <CustomTextInput
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
          iconName={"person-outline"}
          label="Full Name"
        />

        <CustomTextInput
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          iconName={"mail-outline"}
          label="Email Address"
        />

        <CustomTextInput
          label="Password"
          placeholder="Password"
          keyboardType="default"
          secureEntry={true}
          value={password}
          onChangeText={setPassword}
          iconName={"lock-closed-outline"}
        />

        <CustomButton
          label="Sign Up"
          onPress={handleSignUp}
          isDisabled={!isFormValid || loading}
          loading={loading}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: mutedTextColor }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.linkText, { color: accentColor }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    paddingHorizontal: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
