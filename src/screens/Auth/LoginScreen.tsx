import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CustomTextInput } from "../../components/auth/CustomTextInput";
import { CustomButton } from "../../components/CustomButton";
import { loginScreenLogic } from "../../services/logic/loginScreenLogic";

export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isFormValid,
    handleLogin,
  } = loginScreenLogic();

  const navigation = useNavigation<any>();

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
            <Text style={styles.loginSubtitle}>
              Enter Your Credentials to continue
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Form Fields */}

        <CustomTextInput
          label="Email"
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChange={setEmail}
          iconName={"person-outline"}
          withGreenDt={true}
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

        {/* Submit Button */}
        <CustomButton
          onPress={handleLogin}
          isDisabled={!isFormValid}
          label="Let's Start"
          loading={isLoading}
        />

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
