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
import { AuthService } from "../api/authService";
import { AppDispatch } from "../../redux/store/store";
import { clearAuthTokens, saveAuthTokens } from "../auth/session";
import { showAppBanner } from "../../components/OfflineBanner";

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

    dispatch(loginStart());
    try {
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
      showAppBanner(errorMessage, "error");
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
