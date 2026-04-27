import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PlaylistSummary, Track } from "../../../types";
import { LibraryService } from "../../../services/api/libraryService";
import { getRecommendedSongs, searchSongs } from "../../../services/api/api";

const HOME_FEED_TTL_MS = 5 * 60 * 1000;

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface HomeFeedState {
  recommended: Track[];
  suggestions: Track[];
  fullSuggestions: Track[];
  lastFetchedAt: number | null;
}

interface LoadingStates {
  likedSongs: RequestStatus;
  playlists: RequestStatus;
  togglingLike: RequestStatus;
  homeFeed: RequestStatus;
  creatingPlaylist: RequestStatus;
  deletingPlaylist: RequestStatus;
}

interface LibraryState {
  likedSongs: Track[];
  playlists: PlaylistSummary[];
  loadingStates: LoadingStates;
  likedSongsLastFetchedAt: number | null;
  playlistsLastFetchedAt: number | null;
  homeFeed: HomeFeedState;
  error: string | null;
}

export const fetchLikedSongs = createAsyncThunk<
  Track[],
  void,
  { rejectValue: string }
>("library/fetchLikedSongs", async (_, { rejectWithValue }) => {
  try {
    return await LibraryService.fetchLikedSongs();
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const toggleLikeSongAction = createAsyncThunk<
  Track,
  Track,
  { rejectValue: string }
>("library/toggleLikeSong", async (track, { rejectWithValue }) => {
  try {
    await LibraryService.toggleLike(track.id);
    return track;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const fetchPlaylists = createAsyncThunk<
  PlaylistSummary[],
  void,
  { rejectValue: string }
>("library/fetchPlaylists", async (_, { rejectWithValue }) => {
  try {
    return await LibraryService.fetchPlaylists();
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const createPlaylistAction = createAsyncThunk<
  PlaylistSummary,
  string,
  { rejectValue: string }
>("library/createPlaylist", async (name, { rejectWithValue }) => {
  try {
    return await LibraryService.createPlaylist(name);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const deletePlaylistAction = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("library/deletePlaylist", async (playlistId, { rejectWithValue }) => {
  try {
    await LibraryService.deletePlaylist(playlistId);
    return playlistId;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const addTrackToPlaylistAction = createAsyncThunk(
  "library/addTrackToPlaylist",
  async (
    { playlistId, trackId }: { playlistId: string; trackId: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await LibraryService.addTrackToPlaylist(playlistId, trackId);
      dispatch(fetchPlaylists());
      return { playlistId, trackId };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

export const removeTrackFromPlaylistAction = createAsyncThunk(
  "library/removeTrackFromPlaylist",
  async (
    { playlistId, trackId }: { playlistId: string; trackId: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await LibraryService.removeTrackFromPlaylist(playlistId, trackId);
      dispatch(fetchPlaylists());
      return { playlistId, trackId };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

export const fetchHomeFeed = createAsyncThunk<
  Pick<HomeFeedState, "recommended" | "suggestions" | "fullSuggestions">,
  void,
  { rejectValue: string; state: { library: LibraryState } }
>(
  "library/fetchHomeFeed",
  async (_, { rejectWithValue }) => {
    try {
      const [topTracks, suggestionTracks] = await Promise.all([
        getRecommendedSongs(),
        searchSongs("Jazz"),
      ]);

      return {
        recommended: topTracks.slice(0, 5),
        suggestions: suggestionTracks.slice(0, 6),
        fullSuggestions: suggestionTracks,
      };
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to fetch home feed");
    }
  },
  {
    condition: (_, { getState }) => {
      const { library } = getState();
      if (library.loadingStates.homeFeed === "loading") {
        return false;
      }

      if (!library.homeFeed.lastFetchedAt) {
        return true;
      }

      return Date.now() - library.homeFeed.lastFetchedAt > HOME_FEED_TTL_MS;
    },
  },
);

const initialState: LibraryState = {
  likedSongs: [],
  playlists: [],
  loadingStates: {
    likedSongs: "idle",
    playlists: "idle",
    togglingLike: "idle",
    homeFeed: "idle",
    creatingPlaylist: "idle",
    deletingPlaylist: "idle",
  },
  likedSongsLastFetchedAt: null,
  playlistsLastFetchedAt: null,
  homeFeed: {
    recommended: [],
    suggestions: [],
    fullSuggestions: [],
    lastFetchedAt: null,
  },
  error: null,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikedSongs.pending, (state) => {
        state.loadingStates.likedSongs = "loading";
      })
      .addCase(fetchLikedSongs.fulfilled, (state, action) => {
        state.loadingStates.likedSongs = "succeeded";
        state.likedSongs = action.payload;
        state.likedSongsLastFetchedAt = Date.now();
      })
      .addCase(fetchLikedSongs.rejected, (state, action) => {
        state.loadingStates.likedSongs = "failed";
        state.error = action.payload as string;
      })
      .addCase(toggleLikeSongAction.pending, (state) => {
        state.loadingStates.togglingLike = "loading";
      })
      .addCase(toggleLikeSongAction.fulfilled, (state, action) => {
        state.loadingStates.togglingLike = "succeeded";
        const track = action.payload;
        const exists = state.likedSongs.find((item) => item.id === track.id);

        if (exists) {
          state.likedSongs = state.likedSongs.filter((item) => item.id !== track.id);
        } else {
          state.likedSongs.push(track);
        }
      })
      .addCase(toggleLikeSongAction.rejected, (state, action) => {
        state.loadingStates.togglingLike = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchPlaylists.pending, (state) => {
        state.loadingStates.playlists = "loading";
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loadingStates.playlists = "succeeded";
        state.playlists = action.payload;
        state.playlistsLastFetchedAt = Date.now();
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loadingStates.playlists = "failed";
        state.error = action.payload as string;
      })
      .addCase(createPlaylistAction.pending, (state) => {
        state.loadingStates.creatingPlaylist = "loading";
      })
      .addCase(createPlaylistAction.fulfilled, (state, action) => {
        state.loadingStates.creatingPlaylist = "succeeded";
        state.playlists.push(action.payload);
      })
      .addCase(createPlaylistAction.rejected, (state, action) => {
        state.loadingStates.creatingPlaylist = "failed";
        state.error = action.payload as string;
      })
      .addCase(deletePlaylistAction.pending, (state) => {
        state.loadingStates.deletingPlaylist = "loading";
      })
      .addCase(deletePlaylistAction.fulfilled, (state, action) => {
        state.loadingStates.deletingPlaylist = "succeeded";
        state.playlists = state.playlists.filter((item) => item.id !== action.payload);
      })
      .addCase(deletePlaylistAction.rejected, (state, action) => {
        state.loadingStates.deletingPlaylist = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchHomeFeed.pending, (state) => {
        state.loadingStates.homeFeed = "loading";
      })
      .addCase(fetchHomeFeed.fulfilled, (state, action) => {
        state.loadingStates.homeFeed = "succeeded";
        state.homeFeed = {
          ...action.payload,
          lastFetchedAt: Date.now(),
        };
      })
      .addCase(fetchHomeFeed.rejected, (state, action) => {
        state.loadingStates.homeFeed = "failed";
        state.error = action.payload as string;
      });
  },
});

export const selectLikedSongsLoading = (state: { library: LibraryState }) =>
  state.library.loadingStates.likedSongs === "loading";

export const selectPlaylistsLoading = (state: { library: LibraryState }) =>
  state.library.loadingStates.playlists === "loading" ||
  state.library.loadingStates.creatingPlaylist === "loading" ||
  state.library.loadingStates.deletingPlaylist === "loading";

export default librarySlice.reducer;
