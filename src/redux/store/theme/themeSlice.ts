import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Appearance } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean; // Keep for legacy/derived usage if needed, but primary is themeMode
  accentColor: string;
  hasHydrated: boolean;
  advancedBlurEnabled: boolean;
  blurIntensity: number;
}

const getSystemDarkMode = () => Appearance.getColorScheme() === "dark";

const initialState: ThemeState = {
  themeMode: "system",
  isDarkMode: getSystemDarkMode(),
  accentColor: "#B34A30", // Standard GiG Player Red
  hasHydrated: false,
  advancedBlurEnabled: true,
  blurIntensity: 100,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      if (action.payload === "system") {
        state.isDarkMode = getSystemDarkMode();
        return;
      }

      state.isDarkMode = action.payload === "dark";
    },
    toggleTheme: (state) => {
      state.themeMode = state.isDarkMode ? "light" : "dark";
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.themeMode = action.payload ? "dark" : "light";
    },
    updateDerivedDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    },
    setThemeHydrated: (state, action: PayloadAction<boolean>) => {
      state.hasHydrated = action.payload;
    },
    setAdvancedBlurEnabled: (state, action: PayloadAction<boolean>) => {
      state.advancedBlurEnabled = action.payload;
    },
    setBlurIntensity: (state, action: PayloadAction<number>) => {
      state.blurIntensity = action.payload;
    },
  },
});

export const { 
  toggleTheme, 
  setDarkMode, 
  setAccentColor, 
  setThemeHydrated, 
  setThemeMode,
  setAdvancedBlurEnabled,
  setBlurIntensity,
  updateDerivedDarkMode
} = themeSlice.actions;
export default themeSlice.reducer;
