export interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  image: string;
  duration: number;
  uri: string;
  previewUrl: string;
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
