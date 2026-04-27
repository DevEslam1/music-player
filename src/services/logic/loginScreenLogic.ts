import { useNavigation } from "@react-navigation/native";
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  loginFailure,
  loginStart,
  selectAuthLoading,
} from "../../redux/store/auth/authSlice";
import { validateEmail, validatePassword } from "../../utils/validation";
import { Alert } from "react-native";
import { AuthService } from "../api/authService";
import { AppDispatch } from "../../redux/store/store";
import { clearAuthTokens, saveAuthTokens } from "../auth/session";

/**
 * Professional Junior Logic Note:
 * Added 'useCallback' for the login handler. 
 * This keeps the UI snappy during text input changes! 
 */

export function loginScreenLogic() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = useSelector(selectAuthLoading);

  const isFormValid = email.trim().length > 0 && password.length >= 8;

  const handleLogin = useCallback(async () => {
    if (validateEmail(email) !== null) {
      Alert.alert("Invalid Email", `${validateEmail(email)}`);
      return;
    }

    if (validatePassword(password) !== null) {
      Alert.alert("Weak Password", `${validatePassword(password)}`);
      return;
    }

    dispatch(loginStart());
    try {
      // Clear previous tokens for a truly fresh session
      await clearAuthTokens();

      const data = await AuthService.login({ email, password });
      const { access, refresh } = data;

      await saveAuthTokens({ access, refresh });

      await dispatch(fetchProfile()).unwrap();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      dispatch(loginFailure(errorMessage));
      Alert.alert("Login Failed", errorMessage);
    }
  }, [email, password, dispatch]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isFormValid,
    handleLogin,
  };
}
