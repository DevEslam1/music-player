import { axiosClient, BASE_DOMAIN } from "./axiosClient";
import { Track } from "../../types";


export interface CustomApiTrackRaw {
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
  
  let fullUrl: string;
  if (url.startsWith("http")) {
    fullUrl = url;
  } else {
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    fullUrl = `${BASE_DOMAIN}${cleanUrl}`;
  }
  
  
  return fullUrl.replace(/^http:\/\//i, 'https://');
};

export const mapCustomTrackToModel = (track: CustomApiTrackRaw): Track => ({
  id: String(track.id),
  name: track.title,
  artist: track.artist || "Unknown Artist",
  album: "Unknown Album",
  image: ensureAbsoluteUrl(track.cover_url),
  duration: track.duration * 1000,
  uri: ensureAbsoluteUrl(track.stream_url),
  previewUrl: ensureAbsoluteUrl(track.stream_url),
});

export const searchSongs = async (query: string, offset: number = 0): Promise<Track[]> => {
  const response = await axiosClient.get(`tracks/search/`, {
    params: { q: query, limit: 10, offset }
  });
  const data = response.data || [];
  return data.map(mapCustomTrackToModel);
};

export const getRecommendedSongs = async (): Promise<Track[]> => {
  const response = await axiosClient.get('recommendations/');
  const data = response.data || [];
  return data.map(mapCustomTrackToModel);
};
