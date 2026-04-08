import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track, Playlist } from "../../../types";

interface LibraryState {
  likedSongs: Track[];
  playlists: Playlist[];
}

const initialState: LibraryState = {
  likedSongs: [],
  playlists: [],
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    toggleLikeSong: (state, action: PayloadAction<Track>) => {
      const exists = state.likedSongs.find(t => t.id === action.payload.id);
      if (exists) {
        state.likedSongs = state.likedSongs.filter(t => t.id !== action.payload.id);
      } else {
        state.likedSongs.push(action.payload);
      }
    },
    createPlaylist: (state, action: PayloadAction<Playlist>) => {
      state.playlists.push(action.payload);
    },
    deletePlaylist: (state, action: PayloadAction<string>) => {
      state.playlists = state.playlists.filter(p => p.id !== action.payload);
    },
    addSongToPlaylist: (state, action: PayloadAction<{playlistId: string, track: Track}>) => {
      const p = state.playlists.find(p => p.id === action.payload.playlistId);
      if (p && !p.tracks.find(t => t.id === action.payload.track.id)) {
        p.tracks.push(action.payload.track);
      }
    },
    removeSongFromPlaylist: (state, action: PayloadAction<{playlistId: string, trackId: string}>) => {
      const p = state.playlists.find(p => p.id === action.payload.playlistId);
      if (p) {
        p.tracks = p.tracks.filter(t => t.id !== action.payload.trackId);
      }
    }
  },
});

export const { toggleLikeSong, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } = librarySlice.actions;
export default librarySlice.reducer;
