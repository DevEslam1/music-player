import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DownloadsState {
  downloadedTrackIds: string[];
}

const initialState: DownloadsState = {
  downloadedTrackIds: [],
};

const downloadsSlice = createSlice({
  name: "downloads",
  initialState,
  reducers: {
    setDownloadedTracks: (state, action: PayloadAction<string[]>) => {
      state.downloadedTrackIds = action.payload;
    },
    addDownload: (state, action: PayloadAction<string>) => {
      if (!state.downloadedTrackIds.includes(action.payload)) {
        state.downloadedTrackIds.push(action.payload);
      }
    },
    removeDownload: (state, action: PayloadAction<string>) => {
      state.downloadedTrackIds = state.downloadedTrackIds.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const { setDownloadedTracks, addDownload, removeDownload } = downloadsSlice.actions;
export default downloadsSlice.reducer;
