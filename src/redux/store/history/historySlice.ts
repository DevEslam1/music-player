import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../../../types";

interface HistoryState {
  recentTracks: Track[];
}

const initialState: HistoryState = {
  recentTracks: [],
};

const MAX_HISTORY = 50;

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addTrackToHistory: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      const existingTrack = state.recentTracks.find((t) => t.id === track.id);
      
      const updatedTrack: Track = {
        ...track,
        lastPlayedAt: Date.now(),
        playCount: (existingTrack?.playCount || 0) + 1,
      };

      // Remove if exists
      state.recentTracks = state.recentTracks.filter((t) => t.id !== track.id);
      
      // Add to front
      state.recentTracks.unshift(updatedTrack);
      
      // Cap at MAX_HISTORY
      if (state.recentTracks.length > MAX_HISTORY) {
        state.recentTracks = state.recentTracks.slice(0, MAX_HISTORY);
      }
    },
    clearHistory: (state) => {
      state.recentTracks = [];
    },
  },
});

export const { addTrackToHistory, clearHistory } = historySlice.actions;
export default historySlice.reducer;
