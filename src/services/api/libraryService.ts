import { axiosClient } from "./axiosClient";
import { Track } from "../../types";
import { mapCustomTrackToModel } from "./api";

// Types for backend responses if different from our models
interface BackendPlaylist {
  id: number;
  name: string;
  description: string | null;
  track_count: number;
}

export const LibraryService = {
  // LIKED SONGS
  fetchLikedSongs: async (): Promise<Track[]> => {
    const response = await axiosClient.get("liked/");
    const data = response.data || [];
    return data.map(mapCustomTrackToModel);
  },

  toggleLike: async (trackId: string): Promise<void> => {
    await axiosClient.post(`tracks/${trackId}/like/`);
  },

  // PLAYLISTS
  fetchPlaylists: async (): Promise<any[]> => {
    const response = await axiosClient.get("playlists/");
    return response.data;
  },

  fetchPlaylistDetail: async (playlistId: string): Promise<any> => {
    const response = await axiosClient.get(`playlists/${playlistId}/`);
    const data = response.data;
    if (data && Array.isArray(data.tracks)) {
      data.tracks = data.tracks.map(mapCustomTrackToModel);
    }
    return data;
  },

  createPlaylist: async (name: string, description?: string): Promise<any> => {
    const response = await axiosClient.post("playlists/", { name, description });
    return response.data;
  },

  deletePlaylist: async (playlistId: string): Promise<void> => {
    await axiosClient.delete(`playlists/${playlistId}/`);
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string): Promise<void> => {
    await axiosClient.post(`playlists/${playlistId}/add_track/`, { track_id: trackId });
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string): Promise<void> => {
    await axiosClient.delete(`playlists/${playlistId}/remove_track/`, { data: { track_id: trackId } });
  },

  // HISTORY
  logPlay: async (trackId: string): Promise<void> => {
    await axiosClient.post(`tracks/${trackId}/play/`);
  },
  
  fetchHistory: async (): Promise<Track[]> => {
    const response = await axiosClient.get("history/");
    const data = response.data || [];
    // The history endpoint often returns { track: ..., played_at: ... } 
    // or just the track array depending on the serializer.
    // Based on standard patterns, we map it accordingly.
    return data.map((item: any) => 
      item.track ? mapCustomTrackToModel(item.track) : mapCustomTrackToModel(item)
    );
  }
};
