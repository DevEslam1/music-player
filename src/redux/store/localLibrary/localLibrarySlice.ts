import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LocalTrack, LocalAlbum, LocalArtist, LocalFolder } from "../../../types";
import { LocalMusicService } from "../../../services/local/localMusicService";

// ─── State ────────────────────────────────────────────────────────────────────

export type ScanStatus = "idle" | "scanning" | "done" | "error";
export type PermissionStatus = "undetermined" | "granted" | "denied";

interface LocalLibraryState {
  tracks: LocalTrack[];
  artists: LocalArtist[];
  albums: LocalAlbum[];
  folders: LocalFolder[];
  scanStatus: ScanStatus;
  scanProgress: { scanned: number; total: number };
  permissionStatus: PermissionStatus;
  lastScannedAt: number | null;
  /** Album IDs (name-slugs) whose ID3 metadata has been fully enriched */
  enrichedAlbumIds: string[];
  error: string | null;
}

const initialState: LocalLibraryState = {
  tracks: [],
  artists: [],
  albums: [],
  folders: [],
  scanStatus: "idle",
  scanProgress: { scanned: 0, total: 0 },
  permissionStatus: "undetermined",
  lastScannedAt: null,
  enrichedAlbumIds: [],
  error: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildArtists(tracks: LocalTrack[]): LocalArtist[] {
  const map: Record<string, { tracks: Set<string>; albums: Set<string>; image: string }> = {};
  for (const t of tracks) {
    if (!map[t.artist]) map[t.artist] = { tracks: new Set(), albums: new Set(), image: "" };
    map[t.artist].tracks.add(t.id);
    if (t.album) map[t.artist].albums.add(t.album);
    if (!map[t.artist].image && t.image) map[t.artist].image = t.image;
  }
  return Object.entries(map)
    .map(([name, data]) => ({
      name,
      trackCount: data.tracks.size,
      albumCount: data.albums.size,
      coverImage: data.image,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildAlbums(tracks: LocalTrack[]): LocalAlbum[] {
  const map: Record<string, { tracks: LocalTrack[]; artistCounts: Record<string, number> }> = {};
  for (const t of tracks) {
    const key = t.album || "Unknown Album";
    if (!map[key]) map[key] = { tracks: [], artistCounts: {} };
    map[key].tracks.push(t);
    map[key].artistCounts[t.artist] = (map[key].artistCounts[t.artist] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, data]) => {
      const topArtist = Object.entries(data.artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown Artist";
      const cover = data.tracks.find(t => t.image)?.image ?? "";
      return {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        artist: topArtist,
        trackCount: data.tracks.length,
        coverImage: cover,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildFolders(tracks: LocalTrack[]): LocalFolder[] {
  const map: Record<string, number> = {};
  for (const t of tracks) {
    const key = t.folderPath || "Unknown";
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([path, trackCount]) => ({
      path,
      name: path.split("/").filter(Boolean).pop() ?? path,
      trackCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * Scan device for local audio files.
 * Dispatches setScanProgress during the scan so the UI can show progress.
 */
export const scanLocalLibrary = createAsyncThunk<
  { tracks: LocalTrack[]; timestamp: number },
  { forceRescan?: boolean } | undefined,
  { rejectValue: string }
>("localLibrary/scan", async (args, { dispatch, rejectWithValue }) => {
  try {
    // Request permission
    const permStatus = await LocalMusicService.requestPermission();
    dispatch(setPermissionStatus(permStatus));
    if (permStatus !== "granted") {
      return rejectWithValue("Permission denied");
    }

    // Try loading from cache first (unless forced rescan)
    if (!args?.forceRescan) {
      const cached = await LocalMusicService.loadCache();
      if (cached) {
        return { tracks: cached.tracks, timestamp: cached.timestamp };
      }
    }

    // Full scan with progress callback
    const tracks = await LocalMusicService.scanDevice((scanned, total) => {
      dispatch(setScanProgress({ scanned, total }));
    });

    // Cache the result
    await LocalMusicService.saveCache(tracks);

    return { tracks, timestamp: Date.now() };
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Scan failed");
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const localLibrarySlice = createSlice({
  name: "localLibrary",
  initialState,
  reducers: {
    setPermissionStatus(state, action: PayloadAction<PermissionStatus>) {
      state.permissionStatus = action.payload;
    },
    setScanProgress(state, action: PayloadAction<{ scanned: number; total: number }>) {
      state.scanProgress = action.payload;
    },
    /** Replace tracks + rebuild indices after enrichment */
    updateEnrichedTracks(state, action: PayloadAction<{ albumId: string; tracks: LocalTrack[] }>) {
      const { albumId, tracks: enriched } = action.payload;
      const enrichedIds = new Set(enriched.map(t => t.id));
      const merged = state.tracks.map(t => (enrichedIds.has(t.id) ? (enriched.find(e => e.id === t.id) ?? t) : t));
      state.tracks = merged;
      state.albums = buildAlbums(merged);
      state.artists = buildArtists(merged);
      if (!state.enrichedAlbumIds.includes(albumId)) {
        state.enrichedAlbumIds.push(albumId);
      }
    },
    clearLocalLibrary(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(scanLocalLibrary.pending, (state) => {
        state.scanStatus = "scanning";
        state.error = null;
        state.scanProgress = { scanned: 0, total: 0 };
      })
      .addCase(scanLocalLibrary.fulfilled, (state, action) => {
        const { tracks, timestamp } = action.payload;
        state.tracks = tracks;
        state.artists = buildArtists(tracks);
        state.albums = buildAlbums(tracks);
        state.folders = buildFolders(tracks);
        state.scanStatus = "done";
        state.lastScannedAt = timestamp;
        state.error = null;
      })
      .addCase(scanLocalLibrary.rejected, (state, action) => {
        state.scanStatus = "error";
        state.error = action.payload ?? "Unknown error";
        if (action.payload === "Permission denied") {
          state.permissionStatus = "denied";
        }
      });
  },
});

export const {
  setPermissionStatus,
  setScanProgress,
  updateEnrichedTracks,
  clearLocalLibrary,
} = localLibrarySlice.actions;

export default localLibrarySlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTracksByAlbum = (tracks: LocalTrack[], albumName: string) =>
  tracks.filter(t => (t.album || "Unknown Album") === albumName);

export const selectTracksByArtist = (tracks: LocalTrack[], artistName: string) =>
  tracks.filter(t => t.artist === artistName);

export const selectTracksByFolder = (tracks: LocalTrack[], folderPath: string) =>
  tracks.filter(t => t.folderPath === folderPath);
