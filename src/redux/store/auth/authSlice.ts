import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "../../../services/api/authService";
import { User } from "../../../types";
import { clearAuthTokens } from "../../../services/auth/session";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
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

export const logoutAction = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await clearAuthTokens();
  } catch (error) {
    return rejectWithValue("Failed to clear the session");
  }
});

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  failed: string | null;
  isLoggedIn: boolean;
  isGuestMode: boolean;
  isFirstLaunch: boolean | null; // null means checking
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  failed: null,
  isLoggedIn: false,
  isGuestMode: false,
  isFirstLaunch: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.failed = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.isGuestMode = false;
      state.currentUser = action.payload;
      // Persist user to storage
      AsyncStorage.setItem('current_user', JSON.stringify(action.payload)).catch(e => console.warn('Failed to persist user:', e));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.failed = action.payload;
    },
    logoutCompleted: (state) => {
      state.isLoggedIn = false;
      state.isGuestMode = false;
      state.currentUser = null;
      state.loading = false;
      AsyncStorage.removeItem('current_user').catch(e => console.warn('Failed to clear persisted user:', e));
    },
    setGuestMode: (state, action: PayloadAction<boolean>) => {
      state.isGuestMode = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    hydrateUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isLoggedIn = true;
      state.isGuestMode = false;
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
        AsyncStorage.setItem('current_user', JSON.stringify(action.payload)).catch(e => console.warn('Failed to persist user:', e));
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.failed = action.payload as string;
      })
      .addCase(logoutAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.isGuestMode = false;
        state.currentUser = null;
        state.loading = false;
        AsyncStorage.removeItem('current_user').catch(e => console.warn('Failed to clear persisted user:', e));
      })
      .addCase(logoutAction.rejected, (state, action) => {
        state.loading = false;
        state.failed = action.payload as string;
      });
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutCompleted,
  setGuestMode,
  setFirstLaunch,
  hydrateUser,
} = authSlice.actions;
export const selectAuthLoading = (state: any) => state.auth.loading;
export default authSlice.reducer;
