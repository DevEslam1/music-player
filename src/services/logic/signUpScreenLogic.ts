import { useNavigation } from "@react-navigation/native";
import { useState, useCallback } from "react";
import { validateEmail, validatePassword } from "../../utils/validation";
import { AuthService } from "../api/authService";
import { showAppBanner } from "../../components/OfflineBanner";

/**
 * Junior Developer Logic Tips:
 * I used 'useCallback' here so handleSignUp doesn't rebuild 
 * on every keystroke. It saves memory and makes the UI smoother! ✨
 */

export function useSignUpScreenLogic() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    name.trim().length > 0 && email.trim().length > 0 && password.length >= 8;

  const handleSignUp = useCallback(async () => {
    if (!name || !email || !password) {
      showAppBanner("Please fill in all fields.", "warning");
      return;
    }

    const emailError = validateEmail(email);
    if (emailError !== null) {
      showAppBanner(emailError, "warning");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError !== null) {
      showAppBanner(passwordError, "warning");
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        username: name,
        email: email,
        password: password,
      });
      showAppBanner("Account created! Please log in.", "success");
      navigation.navigate("Login");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {})
          .flat()
          .join(", ") ||
        "Registration failed. Please try again.";
      showAppBanner(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [name, email, password, navigation]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    loading,
    setLoading,
    isFormValid,
    handleSignUp,
  };
}
