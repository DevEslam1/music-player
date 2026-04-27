import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Track } from "../../../types";
import { DownloadService } from "../../../services/api/downloadService";
import { RootState } from "../store";


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
  autoDownloadEnabled: boolean;
}

const initialState: DownloadsState = {
  tracks: {},
  activeDownloads: {},
  autoDownloadEnabled: false,
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
    setAutoDownloadEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoDownloadEnabled = action.payload;
    },
  },
});

export const { 
  hydrateDownloads, 
  upsertDownload, 
  removeDownload, 
  setDownloadProgress, 
  clearDownloadProgress,
  setAutoDownloadEnabled 
} = downloadsSlice.actions;

export const selectIsDownloaded = (state: { downloads: DownloadsState }, trackId: string) => 
  !!state.downloads.tracks[trackId];

export const selectDownloadProgress = (state: { downloads: DownloadsState }, trackId: string) => 
  state.downloads.activeDownloads[trackId];

export const batchDownloadTracksAction = createAsyncThunk<
  void,
  Track[],
  { state: RootState }
>("downloads/batchDownload", async (tracks, { getState, dispatch }) => {
  const state = getState();
  const { tracks: downloadedTracks, activeDownloads } = state.downloads;

  // Filter out tracks that are already downloaded or actively downloading
  const tracksToDownload = tracks.filter(t => {
    return !downloadedTracks[t.id] && !activeDownloads[t.id];
  });

  if (tracksToDownload.length > 0) {
    tracksToDownload.forEach(track => {
      dispatch(setDownloadProgress({ trackId: track.id, progress: 0, status: 'downloading' }));
      DownloadService.downloadTrack(track).catch(e => {
        console.warn('Batch download failed for track', track.id, e);
      });
    });
  }
});

export default downloadsSlice.reducer;
