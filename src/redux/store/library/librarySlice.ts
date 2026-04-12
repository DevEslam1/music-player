import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Track, Playlist } from "../../../types";
import { LibraryService } from "../../../services/api/libraryService";

// ASYNC THUNKS
export const fetchLikedSongs = createAsyncThunk(
  "library/fetchLikedSongs",
  async (_, { rejectWithValue }) => {
    try {
      return await LibraryService.fetchLikedSongs();
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const toggleLikeSongAction = createAsyncThunk(
  "library/toggleLikeSong",
  async (track: Track, { rejectWithValue }) => {
    try {
      await LibraryService.toggleLike(track.id);
      return track;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchPlaylists = createAsyncThunk(
  "library/fetchPlaylists",
  async (_, { rejectWithValue }) => {
    try {
      return await LibraryService.fetchPlaylists();
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const createPlaylistAction = createAsyncThunk(
  "library/createPlaylist",
  async (name: string, { rejectWithValue }) => {
    try {
      return await LibraryService.createPlaylist(name);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deletePlaylistAction = createAsyncThunk(
  "library/deletePlaylist",
  async (playlistId: string, { rejectWithValue }) => {
    try {
      await LibraryService.deletePlaylist(playlistId);
      return playlistId;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

interface LibraryState {
  likedSongs: Track[];
  playlists: any[];
  loading: boolean;
  error: string | null;
}

const initialState: LibraryState = {
  likedSongs: [],
  playlists: [],
  loading: false,
  error: null,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH LIKED
      .addCase(fetchLikedSongs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLikedSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.likedSongs = action.payload;
      })
      .addCase(fetchLikedSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // TOGGLE LIKE
      .addCase(toggleLikeSongAction.fulfilled, (state, action) => {
        const track = action.payload;
        const exists = state.likedSongs.find(t => t.id === track.id);
        if (exists) {
          state.likedSongs = state.likedSongs.filter(t => t.id !== track.id);
        } else {
          state.likedSongs.push(track);
        }
      })
      
      // FETCH PLAYLISTS
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.playlists = action.payload;
      })
      
      // CREATE PLAYLIST
      .addCase(createPlaylistAction.fulfilled, (state, action) => {
        state.playlists.push(action.payload);
      })
      
      // DELETE PLAYLIST
      .addCase(deletePlaylistAction.fulfilled, (state, action) => {
        state.playlists = state.playlists.filter(p => p.id !== action.payload);
      });
  },
});

export default librarySlice.reducer;
