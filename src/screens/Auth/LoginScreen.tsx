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
import { useLoginScreenLogic } from "../../services/logic/loginScreenLogic";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";

// Reusable Header
import { AuthHeader } from "../../components/auth/AuthHeader";

export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isFormValid,
    handleLogin,
  } = useLoginScreenLogic();

  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const mutedTextColor = useThemeColor(
    { light: "#64748B", dark: "#94A3B8" },
    "text",
  );
  const cardColor = useThemeColor(
    { light: "#FCE8E2", dark: "rgba(179, 74, 48, 0.18)" },
    "surface",
  );
  const dividerColor = useThemeColor(
    { light: "#E2E8F0", dark: "rgba(148, 163, 184, 0.2)" },
    "surface",
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Centered Auth Header */}
      <AuthHeader 
        title="Welcome Back" 
        subtitle="Where Sound Comes Alive" 
        alignCenter={true}
      />

      <View style={styles.loginCard}>
        {/* Log In Title Row */}
        <View style={styles.loginTitleRow}>
          <View style={[styles.iconBox, { backgroundColor: cardColor }]}>
            <Ionicons name="log-in-outline" size={20} color={accentColor} />
          </View>
          <View style={styles.loginTitleText}>
            <Text style={[styles.loginTitle, { color: textColor }]}>Log In</Text>
            <Text style={[styles.loginSubtitle, { color: mutedTextColor }]}>
              Enter Your Credentials to continue
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <CustomTextInput
          label="Email"
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          iconName={"person-outline"}
          withGreenDt={true}
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
          onPress={handleLogin}
          isDisabled={!isFormValid}
          label="Let's Start"
          loading={isLoading}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: mutedTextColor }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={[styles.signUpLink, { color: accentColor }]}>Sign Up</Text>
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
  },
  loginSubtitle: {
    fontSize: 12,
  },
  divider: {
    height: 1,
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
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
