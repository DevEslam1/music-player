import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "../../../services/api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const userData = await AuthService.me();
      return userData;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch profile",
      );
    }
  },
);

interface AuthState {
  currentUser: any;
  loading: boolean;
  failed: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  failed: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.failed = null;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.currentUser = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.failed = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.currentUser = null;
      AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.currentUser = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.failed = action.payload as string;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export const selectAuthLoading = (state: any) => state.auth.loading;
export default authSlice.reducer;
