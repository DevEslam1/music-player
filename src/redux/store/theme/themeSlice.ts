import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  isDarkMode: boolean;
  accentColor: string;
}

const initialState: ThemeState = {
  isDarkMode: false,
  accentColor: "#B34A30", // Standard GiG Player Red
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setAccentColor: (state, action: PayloadAction<string>) => {
      state.accentColor = action.payload;
    }
  },
});

export const { toggleTheme, setDarkMode, setAccentColor } = themeSlice.actions;
export default themeSlice.reducer;
