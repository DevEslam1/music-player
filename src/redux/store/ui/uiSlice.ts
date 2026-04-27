import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BannerType = "error" | "success" | "info" | "warning";

export interface BannerState {
  visible: boolean;
  message: string;
  type: BannerType;
}

interface UIState {
  banner: BannerState;
}

const initialState: UIState = {
  banner: {
    visible: false,
    message: "",
    type: "info",
  },
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
  },
});

export const { showBanner, hideBanner } = uiSlice.actions;
export default uiSlice.reducer;
