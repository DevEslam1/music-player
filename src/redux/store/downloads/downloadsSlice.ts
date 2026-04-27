import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../../../types";

export interface DownloadedTrack extends Track {
  localUri: string;
  size?: number; // Size in bytes
}

export interface DownloadProgress {
  trackId: string;
  progress: number; // 0-1
  status: 'queued' | 'downloading' | 'done' | 'error';
  errorMessage?: string;
}

interface DownloadsState {
  tracks: Record<string, DownloadedTrack>;
  activeDownloads: Record<string, DownloadProgress>;
}

const initialState: DownloadsState = {
  tracks: {},
  activeDownloads: {},
};

const downloadsSlice = createSlice({
  name: "downloads",
  initialState,
  reducers: {
    hydrateDownloads: (state, action: PayloadAction<Record<string, DownloadedTrack>>) => {
      state.tracks = action.payload;
    },
    upsertDownload: (state, action: PayloadAction<DownloadedTrack>) => {
      state.tracks[action.payload.id] = action.payload;
    },
    removeDownload: (state, action: PayloadAction<string>) => {
      delete state.tracks[action.payload];
      delete state.activeDownloads[action.payload];
    },
    setDownloadProgress: (state, action: PayloadAction<DownloadProgress>) => {
      state.activeDownloads[action.payload.trackId] = action.payload;
    },
    clearDownloadProgress: (state, action: PayloadAction<string>) => {
      delete state.activeDownloads[action.payload];
    },
  },
});

export const { 
  hydrateDownloads, 
  upsertDownload, 
  removeDownload, 
  setDownloadProgress, 
  clearDownloadProgress 
} = downloadsSlice.actions;

export const selectIsDownloaded = (state: { downloads: DownloadsState }, trackId: string) => 
  !!state.downloads.tracks[trackId];

export const selectDownloadProgress = (state: { downloads: DownloadsState }, trackId: string) => 
  state.downloads.activeDownloads[trackId];

export default downloadsSlice.reducer;
