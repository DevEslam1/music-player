import { axiosClient } from "./axiosClient";
import { PlaylistSummary, Track } from "../../types";
import { mapCustomTrackToModel } from "./api";

export const LibraryService = {
  
  fetchLikedSongs: async (): Promise<Track[]> => {
    const response = await axiosClient.get("liked/");
    const data = response.data || [];
    return data.map(mapCustomTrackToModel);
  },

  toggleLike: async (trackId: string): Promise<void> => {
    await axiosClient.post(`tracks/${trackId}/like/`);
  },

  
  fetchPlaylists: async (): Promise<PlaylistSummary[]> => {
    const response = await axiosClient.get("playlists/");
    return response.data;
  },

  fetchPlaylistDetail: async (
    playlistId: string,
  ): Promise<PlaylistSummary & { tracks: Track[] }> => {
    const response = await axiosClient.get(`playlists/${playlistId}/`);
    const data = response.data;
    if (data && Array.isArray(data.tracks)) {
      data.tracks = data.tracks.map(mapCustomTrackToModel);
    }
    return data;
  },

  createPlaylist: async (
    name: string,
    description?: string,
  ): Promise<PlaylistSummary> => {
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

  
  logPlay: async (trackId: string): Promise<void> => {
    await axiosClient.post(`tracks/${trackId}/play/`);
  },
  
  fetchHistory: async (): Promise<Track[]> => {
    const response = await axiosClient.get("history/");
    const data = response.data || [];
    
    
    
    return data.map((item: any) => 
      item.track ? mapCustomTrackToModel(item.track) : mapCustomTrackToModel(item)
    );
  }
};
