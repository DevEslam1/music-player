import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert } from "react-native";
import { validateEmail, validatePassword } from "../../utils/validation";
import { AuthService } from "../api/authService";

export function signUpScreenLogic() {
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
