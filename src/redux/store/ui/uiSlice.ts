import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BannerType = "error" | "success" | "info" | "warning";

export interface BannerState {
  visible: boolean;
  message: string;
  type: BannerType;
}

interface UIState {
  banner: BannerState;
  isDrawerOpen: boolean;
}

const initialState: UIState = {
  banner: {
    visible: false,
    message: "",
    type: "info",
  },
  isDrawerOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showBanner: (
      state,
      action: PayloadAction<{ message: string; type?: BannerType }>
    ) => {
      state.banner.visible = true;
      state.banner.message = action.payload.message;
      state.banner.type = action.payload.type ?? "info";
    },
    hideBanner: (state) => {
      state.banner.visible = false;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
  },
});

export const { showBanner, hideBanner, setDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
