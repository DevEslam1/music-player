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
  sleepTimerEndAt: number | null; // Timestamp when audio should pause
  equalizerSettings: {
    enabled: boolean;
    bandLevels: number[];
    currentPreset: string | null;
  };
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
  sleepTimerEndAt: null,
  equalizerSettings: {
    enabled: false,
    bandLevels: [0, 0, 0, 0, 0],
    currentPreset: null,
  },
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
    playNext: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      // If empty queue, just set as queue
      if (state.queue.length === 0) {
        state.queue = [track];
        return;
      }
      
      const currentIdx = state.currentTrack ? state.queue.findIndex(t => t.id === state.currentTrack?.id) : -1;
      
      // If track is already in queue, remove it first to avoid duplicates
      state.queue = state.queue.filter(t => t.id !== track.id);
      
      if (currentIdx !== -1) {
        // Insert right after current
        state.queue.splice(currentIdx + 1, 0, track);
      } else {
        // Fallback: add to beginning
        state.queue.unshift(track);
      }
    },
    addToQueue: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      // If already in queue, ignore
      if (!state.queue.some(t => t.id === track.id)) {
        state.queue.push(track);
      }
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
    },
    setSleepTimer: (state, action: PayloadAction<number | null>) => {
      state.sleepTimerEndAt = action.payload;
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(t => t.id !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    setEqualizerSettings: (state, action: PayloadAction<Partial<PlayerState['equalizerSettings']>>) => {
      state.equalizerSettings = { ...state.equalizerSettings, ...action.payload };
    }
  },
});

export const { 
  setCurrentTrack, 
  setQueue, 
  playNext,
  addToQueue,
  setIsPlaying, 
  setProgress, 
  toggleShuffle, 
  toggleRepeat,
  setPlaybackError,
  setSleepTimer,
  removeFromQueue,
  clearQueue,
  setEqualizerSettings
} = playerSlice.actions;
export default playerSlice.reducer;
