import { axiosClient } from "./axiosClient";
import { Track } from "../../types";

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
    return response.data;
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
    return response.data;
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
  
  fetchHistory: async (): Promise<any[]> => {
    const response = await axiosClient.get("history/");
    return response.data;
  }
};
