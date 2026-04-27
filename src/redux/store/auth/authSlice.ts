import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "../../../services/api/authService";
import { User } from "../../../types";
import { clearAuthTokens } from "../../../services/auth/session";

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
  isFirstLaunch: boolean | null; // null means checking
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  failed: null,
  isLoggedIn: false,
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
      state.currentUser = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.failed = action.payload;
    },
    logoutCompleted: (state) => {
      state.isLoggedIn = false;
      state.currentUser = null;
      state.loading = false;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
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
      })
      .addCase(logoutAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.currentUser = null;
        state.loading = false;
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
  setFirstLaunch,
} = authSlice.actions;
export const selectAuthLoading = (state: any) => state.auth.loading;
export default authSlice.reducer;
