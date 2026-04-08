import { axiosClient } from "./axiosClient";
import { Track } from "../../types";

// Raw response type for typing the axios request internally
interface DeezerTrackRaw {
  id: number;
  title: string;
  link: string;
  duration: number;
  preview: string;
  artist: {
    name: string;
  };
  album: {
    title: string;
    cover_medium: string;
  };
}

const mapDeezerTrackToModel = (track: DeezerTrackRaw): Track => ({
  id: String(track.id),
  name: track.title,
  artist: track.artist?.name || "Unknown Artist",
  album: track.album?.title || "Unknown Album",
  image: track.album?.cover_medium || "",
  duration: track.duration * 1000,
  uri: track.link,
  previewUrl: track.preview,
});

export const searchSongs = async (query: string): Promise<Track[]> => {
  try {
    const response = await axiosClient.get(`/search?q=${encodeURIComponent(query)}`);
    const data = response.data?.data || [];
    return data.map(mapDeezerTrackToModel);
  } catch (error) {
    console.error("Error fetching songs from Deezer API", error);
    return [];
  }
};

export const getRecommendedSongs = async (): Promise<Track[]> => {
  // We'll mock "recommended" by searching for popular artists or using a chart endpoint
  try {
    const response = await axiosClient.get('/chart/0/tracks');
    const data = response.data?.data || [];
    return data.map(mapDeezerTrackToModel);
  } catch (error) {
    console.error("Error fetching recommended songs", error);
    return [];
  }
};
