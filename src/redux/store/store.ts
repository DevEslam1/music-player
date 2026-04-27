import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import themeReducer from "./theme/themeSlice";
import playerReducer from "./player/playerSlice";
import libraryReducer from "./library/librarySlice";
import downloadsReducer from "./downloads/downloadsSlice";
import uiReducer from "./ui/uiSlice";

export const store = configureStore({
  reducer: { 
    auth: authReducer,
    theme: themeReducer,
    player: playerReducer,
    library: libraryReducer,
    downloads: downloadsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
