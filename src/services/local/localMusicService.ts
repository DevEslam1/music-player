import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalTrack } from "../../types";
import { PermissionStatus } from "../../redux/store/localLibrary/localLibrarySlice";

// Try to import expo-music-info-2 — it's optional (may not be available on web)
let MusicInfo: any = null;
try {
  MusicInfo = require("expo-music-info-2").default;
} catch {
  // Not available on this platform
}

const CACHE_KEY = "@local_library_cache_v2";
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const PAGE_SIZE = 100;

interface CachePayload {
  tracks: LocalTrack[];
  timestamp: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a filename like "Artist - Title.mp3" into { artist, title } */
function parseFilename(filename: string): { title: string; artist: string } {
  const noExt = filename.replace(/\.[^/.]+$/, "");
  const dashIdx = noExt.indexOf(" - ");
  if (dashIdx !== -1) {
    return {
      artist: noExt.slice(0, dashIdx).trim() || "Unknown Artist",
      title: noExt.slice(dashIdx + 3).trim() || noExt,
    };
  }
  return { artist: "Unknown Artist", title: noExt };
}

/** Extract folder name & path from a file URI */
function parseFolderFromUri(uri: string): { folderName: string; folderPath: string } {
  try {
    const decoded = decodeURIComponent(uri);
    const lastSlash = decoded.lastIndexOf("/");
    const folderPath = decoded.slice(0, lastSlash);
    const folderName = folderPath.split("/").filter(Boolean).pop() ?? "Unknown Folder";
    return { folderName, folderPath };
  } catch {
    return { folderName: "Unknown Folder", folderPath: uri };
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

class LocalMusicServiceClass {
  // ── Permission ──────────────────────────────────────────────────────────────

  async requestPermission(): Promise<PermissionStatus> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status === MediaLibrary.PermissionStatus.GRANTED) return "granted";
      if (status === MediaLibrary.PermissionStatus.DENIED) return "denied";
      return "undetermined";
    } catch {
      return "denied";
    }
  }

  // ── Full Scan ────────────────────────────────────────────────────────────────

  /**
   * Scan the device for all audio assets.
   * Uses paginated getAssetsAsync to avoid memory spikes.
   * Calls onProgress(scanned, total) periodically.
   */
  async scanDevice(
    onProgress?: (scanned: number, total: number) => void
  ): Promise<LocalTrack[]> {
    const tracks: LocalTrack[] = [];
    let cursor: string | undefined;
    let total = 0;

    // Get a rough total first for progress display
    try {
      const info = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1,
      });
      total = info.totalCount ?? 0;
    } catch {
      // Ignore — we'll report 0 total
    }

    do {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: PAGE_SIZE,
        after: cursor,
        sortBy: [MediaLibrary.SortBy.default],
      });

      for (const asset of page.assets) {
        // Some devices return video assets even with audio filter — guard by extension
        const ext = asset.filename.split(".").pop()?.toLowerCase() ?? "";
        const audioExts = ["mp3", "m4a", "flac", "ogg", "aac", "wav", "opus", "wma", "alac"];
        if (!audioExts.includes(ext)) continue;

        const { title, artist } = parseFilename(asset.filename);
        const { folderName, folderPath } = parseFolderFromUri(asset.uri);

        tracks.push({
          id: asset.id,
          name: title,
          artist,
          album: "Unknown Album",
          image: "",
          duration: Math.round((asset.duration ?? 0) * 1000),
          uri: asset.uri,
          previewUrl: asset.uri,
          folderName,
          folderPath,
        });
      }

      onProgress?.(tracks.length, total);

      cursor = page.hasNextPage ? page.endCursor : undefined;
    } while (cursor);

    return tracks;
  }

  // ── Metadata Enrichment ───────────────────────────────────────────────────

  /**
   * Enrich a batch of tracks with ID3 metadata via expo-music-info-2.
   * Extracts: title, artist, album, cover art (base64).
   * Falls back to current values on failure.
   * Only runs if MusicInfo is available (skips on web/unsupported).
   */
  async enrichMetadata(tracks: LocalTrack[]): Promise<LocalTrack[]> {
    if (!MusicInfo) return tracks;

    const enriched: LocalTrack[] = [];

    for (const track of tracks) {
      try {
        const info = await MusicInfo.getMusicInfoAsync(track.uri, {
          title: true,
          artist: true,
          album: true,
          picture: true,
        });

        enriched.push({
          ...track,
          name: info?.title || track.name,
          artist: info?.artist || track.artist,
          album: info?.album || track.album,
          image: info?.picture?.pictureData
            ? `data:image/jpeg;base64,${info.picture.pictureData}`
            : track.image,
        });
      } catch {
        enriched.push(track);
      }
    }

    return enriched;
  }

  // ── Cache ─────────────────────────────────────────────────────────────────

  async loadCache(): Promise<CachePayload | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const payload: CachePayload = JSON.parse(raw);
      // Expire after 24 hours
      if (Date.now() - payload.timestamp > CACHE_MAX_AGE_MS) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async saveCache(tracks: LocalTrack[]): Promise<void> {
    try {
      const payload: CachePayload = { tracks, timestamp: Date.now() };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("[LocalMusicService] Failed to save cache:", e);
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore
    }
  }
}

export const LocalMusicService = new LocalMusicServiceClass();
