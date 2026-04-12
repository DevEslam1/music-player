import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../redux/store/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosClient } from "../../services/api/axiosClient";
import { AuthService } from "../../services/api/authService";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long.");
      return;
    }
    
    dispatch(loginStart());
    try {
      const data = await AuthService.login({ email, password });
      const { access, refresh } = data;
      
      await AsyncStorage.setItem("access_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);
      
      dispatch(loginSuccess({ email }));
      navigation.navigate("Drawer");
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Login failed. Please check your credentials.";
      dispatch(loginFailure(errorMessage));
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Where Sound Comes Alive</Text>
      </View>

      <View style={styles.loginCard}>
        {/* Log In Title Section */}
        <View style={styles.loginTitleRow}>
          <View style={styles.iconBox}>
            <Ionicons name="log-in-outline" size={20} color="#B34A30" />
          </View>
          <View style={styles.loginTitleText}>
            <Text style={styles.loginTitle}>Log In</Text>
            <Text style={styles.loginSubtitle}>Enter Your Credentials to continue</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.greenDot} />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Let's Start</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpLink}>Sign Up</Text>
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
    marginTop: 80,
    alignItems: "center",
    marginBottom: 40,
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
  loginCard: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loginTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FCE8E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  loginTitleText: {
    justifyContent: "center",
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },
  loginSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 32,
  },
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
  greenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4ADE80",
    marginLeft: 4,
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
    backgroundColor: "#FAF5F4", // slight tint
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#B34A30",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#B34A30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
  signUpLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B34A30",
  },
});
