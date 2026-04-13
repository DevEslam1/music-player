import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthService } from "../../services/api/authService";
import { validateEmail, validatePassword } from "../../utils/validation";
import { CustomTextInput } from "../../components/auth/CustomTextInput";
import { CustomButton } from "../../components/CustomButton";

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    name.trim().length > 0 && email.trim().length > 0 && password.length >= 8;

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (validateEmail(email) !== null) {
      Alert.alert("Invalid Email", `${validateEmail(email)}`);
      return;
    }

    if (validatePassword(password) !== null) {
      Alert.alert("Weak Password", `${validatePassword(password)}`);
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        username: name,
        email: email,
        password: password,
      });
      Alert.alert("Success", "Account created successfully! Please log in.");
      navigation.navigate("Login");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {})
          .flat()
          .join(", ") ||
        "Registration failed. Please try again.";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our music community</Text>
      </View>

      <View style={styles.card}>
        <CustomTextInput
          placeholder="Your Name"
          value={name}
          onChange={setName}
          iconName={"person-outline"}
          label="Full Name"
        />

        <CustomTextInput
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChange={setEmail}
          iconName={"mail-outline"}
        />

        <CustomTextInput
          label="Password"
          placeholder="Password"
          keyboardType="default"
          secureEntry={true}
          value={password}
          onChange={setPassword}
          iconName={"lock-closed-outline"}
        />

        <CustomButton
          label="Sign Up"
          onPress={handleSignUp}
          isDisabled={!isFormValid || loading}
          loading={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    marginTop: 60,
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
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
    color: "#64748B",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B34A30",
  },
});
