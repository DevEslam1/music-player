import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginFailure,
  loginStart,
  loginSuccess,
  selectAuthLoading,
} from "../../redux/store/auth/authSlice";
import { validateEmail, validatePassword } from "../../utils/validation";
import { Alert } from "react-native";
import { AuthService } from "../api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function loginScreenLogic() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = useSelector(selectAuthLoading);

  const isFormValid = email.trim().length > 0 && password.length >= 8;

  const handleLogin = async () => {
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
      
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");

      const data = await AuthService.login({ email, password });
      const { access, refresh } = data;

      await AsyncStorage.setItem("access_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);

      dispatch(loginSuccess({ email }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      dispatch(loginFailure(errorMessage));
      Alert.alert("Login Failed", errorMessage);
    }
  };

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
