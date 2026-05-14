export interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  image: string;
  duration: number;
  uri: string;
  previewUrl: string;
  lastPlayedAt?: number;
  playCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface PlaylistSummary {
  id: string;
  name: string;
  description?: string | null;
  track_count?: number;
  tracks?: Track[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

// ─── Local Music Types ────────────────────────────────────────────────────────

/**
 * A track sourced from device storage.
 * Intentionally mirrors Track so it can be passed directly to
 * AudioPlayerService.loadPlayTrack() and setQueue() without adapters.
 */
export interface LocalTrack {
  id: string;         // MediaLibrary asset ID
  name: string;       // ID3 title or filename fallback
  artist: string;     // ID3 artist or "Unknown Artist"
  album: string;      // ID3 album or "Unknown Album"
  image: string;      // base64 data URI for cover art, or empty string
  duration: number;   // In milliseconds
  uri: string;        // file:// URI to the audio file
  previewUrl: string; // Same as uri for local tracks
  folderName: string; // Parent folder display name
  folderPath: string; // Full parent folder path (for grouping)
}

export interface LocalAlbum {
  id: string;         // Derived from album name (slugified)
  name: string;
  artist: string;     // Most common artist in album
  trackCount: number;
  coverImage: string; // First track's cover or empty string
}

export interface LocalArtist {
  name: string;
  trackCount: number;
  albumCount: number;
  coverImage: string; // Best available image from their tracks
}

export interface LocalFolder {
  path: string;       // Full folder path (unique key)
  name: string;       // Display name (last path segment)
  trackCount: number;
}
