import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from '../../types';
import { store } from '../../redux/store/store';
import { addDownload, removeDownload, setDownloadedTracks } from '../../redux/store/downloads/downloadsSlice';

const DOWNLOADS_KEY = 'offline_downloads';
const DOWNLOADS_METADATA_KEY = 'offline_downloads_metadata';

export interface DownloadedTrack extends Track {
  localUri: string;
}

export const DownloadService = {
  /**
   * Initializes the download state from AsyncStorage and pushes to Redux
   */
  init: async () => {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (stored) {
        const metadata: Record<string, DownloadedTrack> = JSON.parse(stored);
        const trackIds = Object.keys(metadata);
        store.dispatch(setDownloadedTracks(trackIds));
      }
    } catch (e) {
      console.warn('Failed to init DownloadService:', e);
    }
  },

  /**
   * Fetches all thoroughly downloaded tracks (metadata)
   */
  getDownloadedTracks: async (): Promise<DownloadedTrack[]> => {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (stored) {
        const metadata: Record<string, DownloadedTrack> = JSON.parse(stored);
        return Object.values(metadata);
      }
    } catch (e) {
      console.warn('Failed to get downloaded tracks:', e);
    }
    return [];
  },

  /**
   * Gets the local URI for a track if it's downloaded, null otherwise
   */
  getLocalUri: async (trackId: string): Promise<string | null> => {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (stored) {
        const metadata: Record<string, DownloadedTrack> = JSON.parse(stored);
        const track = metadata[trackId];
        if (track && track.localUri) {
          // Normalize: ensure file:// prefix for expo-audio Android compatibility
          const normalizedUri = track.localUri.startsWith('file://')
            ? track.localUri
            : `file://${track.localUri}`;
          // Double check the file actually exists on disk!
          const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
          if (fileInfo.exists) {
            return normalizedUri;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to get local uri:', e);
    }
    return null;
  },

  /**
   * Downloads a track to physical storage
   */
  downloadTrack: async (track: Track): Promise<void> => {
    try {
      const remoteUrl = track.previewUrl || track.uri;
      if (!remoteUrl) throw new Error('No valid URL to download');

      const urlToDownload = remoteUrl.replace(/^http:\/\//i, 'https://');
      
      // Use a clean filename. Some URLs don't end in .mp3, which was causing the "directory doesn't exist" error.
      const safeId = track.id.toString().replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `track_${safeId}.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download file to disk
      const { uri } = await FileSystem.downloadAsync(urlToDownload, fileUri);

      // Save to metadata mapping
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      const metadata: Record<string, DownloadedTrack> = stored ? JSON.parse(stored) : {};

      // Ensure the localUri is a valid file:// URI for expo-audio on Android
      const localFileUri = uri.startsWith('file://') ? uri : `file://${uri}`;

      metadata[track.id] = {
        ...track,
        // Override duration to 30s (the actual preview length) — the Track.duration
        // from the API is the full Spotify track length (e.g. 3:30), not the 30s preview.
        duration: 30000,
        localUri: localFileUri,
      };

      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(metadata));

      // Update Redux
      store.dispatch(addDownload(track.id));
    } catch (e) {
      console.error('Download failed:', e);
      throw e;
    }
  },

  /**
   * Removes a track from physical storage and metadata
   */
  removeDownload: async (trackId: string): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (!stored) return;

      const metadata: Record<string, DownloadedTrack> = JSON.parse(stored);
      const trackToRemove = metadata[trackId];

      if (trackToRemove && trackToRemove.localUri) {
        // Delete physical file. Ignoring errors if the file is already gone.
        await FileSystem.deleteAsync(trackToRemove.localUri, { idempotent: true });
      }

      delete metadata[trackId];
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(metadata));

      // Update Redux
      store.dispatch(removeDownload(trackId));
    } catch (e) {
      console.error('Failed to remove download:', e);
      throw e;
    }
  }
};
