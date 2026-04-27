import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../../../types";

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  error: string | null;
}

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  isShuffled: false,
  repeatMode: 'off',
  error: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track | null>) => {
      state.currentTrack = action.payload;
      state.error = null; // Clear error when track changes
    },
    setQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action: PayloadAction<{position: number, duration: number}>) => {
      state.positionMillis = action.payload.position;
      state.durationMillis = action.payload.duration;
    },
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled;
    },
    toggleRepeat: (state) => {
      if (state.repeatMode === 'off') state.repeatMode = 'track';
      else if (state.repeatMode === 'track') state.repeatMode = 'queue';
      else state.repeatMode = 'off';
    },
    setPlaybackError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isPlaying = false;
    }
  },
});

export const { 
  setCurrentTrack, 
  setQueue, 
  setIsPlaying, 
  setProgress, 
  toggleShuffle, 
  toggleRepeat,
  setPlaybackError
} = playerSlice.actions;
export default playerSlice.reducer;
