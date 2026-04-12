import { axiosClient, BASE_DOMAIN } from "./axiosClient";
import { Track } from "../../types";

// Raw response type for typing the axios request to the custom API
interface CustomApiTrackRaw {
  id: number;
  title: string;
  artist: string;
  source?: string;
  external_id?: string | null;
  is_preview_only?: boolean;
  genre?: string;
  duration: number;
  cover_url: string | null;
  stream_url: string;
  created_at?: string;
}

const ensureAbsoluteUrl = (url: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_DOMAIN}${cleanUrl}`;
};

const mapCustomTrackToModel = (track: CustomApiTrackRaw): Track => ({
  id: String(track.id),
  name: track.title,
  artist: track.artist || "Unknown Artist",
  album: "Unknown Album",
  image: ensureAbsoluteUrl(track.cover_url),
  duration: track.duration * 1000,
  uri: ensureAbsoluteUrl(track.stream_url),
  previewUrl: ensureAbsoluteUrl(track.stream_url),
});

export const searchSongs = async (query: string): Promise<Track[]> => {
  try {
    const response = await axiosClient.get(`/tracks/search/`, {
      params: { q: query, limit: 10 }
    });
    const data = response.data || [];
    return data.map(mapCustomTrackToModel);
  } catch (error) {
    console.error("Error fetching songs from API", error);
    return [];
  }
};

export const getRecommendedSongs = async (): Promise<Track[]> => {
  try {
    const response = await axiosClient.get('/recommendations/');
    const data = response.data || [];
    return data.map(mapCustomTrackToModel);
  } catch (error) {
    console.error("Error fetching recommended songs", error);
    return [];
  }
};
