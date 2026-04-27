import { Paths, File } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from '../../types';
import { getAccessToken } from '../auth/session';
// We use type imports which are erased at runtime and don't cause require cycles
import type { DownloadedTrack } from '../../redux/store/downloads/downloadsSlice';
import NetInfo from '@react-native-community/netinfo';

const DOWNLOADS_KEY = 'offline_downloads';

// Map to store active resumable downloads for cancellation support
const activeResumables = new Map<string, FileSystemLegacy.DownloadResumable>();

let reduxDispatch: any = null;
let reduxGetState: any = null;
let reduxActions: any = null;

export const DownloadService = {
  /**
   * Inject Redux store methods and actions to avoid circular dependencies
   */
  injectRedux: (dispatch: any, getState: any, actions: any) => {
    reduxDispatch = dispatch;
    reduxGetState = getState;
    reduxActions = actions;
  },

  /**
   * Initializes the download state from AsyncStorage and pushes to Redux
   */
  init: async () => {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (stored) {
        const metadata: Record<string, DownloadedTrack> = JSON.parse(stored);
        if (reduxDispatch && reduxActions?.hydrateDownloads) {
          reduxDispatch(reduxActions.hydrateDownloads(metadata));
        }
      }
    } catch (e) {
      console.warn('Failed to init DownloadService:', e);
    }
  },

  /**
   * Gets the local URI for a track if it's downloaded and valid, null otherwise
   */
  getLocalUri: async (trackId: string): Promise<string | null> => {
    try {
      // 1. Try to get from Redux state first (fastest)
      let track = null;
      if (reduxGetState) {
        const state = reduxGetState();
        track = state.downloads?.tracks?.[trackId];
      }
      let uriToVerify = track?.localUri;

      // 2. Fallback: If not in Redux, check deterministic path
      if (!uriToVerify) {
        const safeId = trackId.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `track_${safeId}.mp3`;
        uriToVerify = new File(Paths.document, fileName).uri;
      }

      if (uriToVerify) {
        const normalizedUri = uriToVerify.startsWith('file://')
          ? uriToVerify
          : `file://${uriToVerify}`;
          
        const file = new File(normalizedUri);
        const { exists, size } = await file.info();
        if (exists && size >= 10240) {
          return normalizedUri;
        } else if (exists) {
          console.warn(`Local file exists but is corrupted (size: ${size}). Treating as not downloaded.`);
          try { file.delete(); } catch (_) {}
          if (reduxDispatch && reduxActions?.removeDownload) {
            reduxDispatch(reduxActions.removeDownload(trackId));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to get local uri:', e);
    }
    return null;
  },

  /**
   * Downloads a track to physical storage with progress reporting
   */
  downloadTrack: async (track: Track): Promise<void> => {
    try {
      // 1. Network Check
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        if (reduxDispatch && reduxActions?.showBanner) {
          reduxDispatch(reduxActions.showBanner({ message: 'Please connect to the internet to download tracks.', type: 'warning' }));
        }
        return;
      }

      // 2. Storage Check (require at least 50MB)
      const freeStorage = Paths.availableDiskSpace;
      if (freeStorage < 50 * 1024 * 1024) {
        if (reduxDispatch && reduxActions?.showBanner) {
          reduxDispatch(reduxActions.showBanner({ message: 'You need at least 50MB of free space to download tracks.', type: 'warning' }));
        }
        return;
      }

      const remoteUrl = track.previewUrl || track.uri;
      if (!remoteUrl) throw new Error('No valid URL to download');

      const urlToDownload = remoteUrl.replace(/^http:\/\//i, 'https://');
      const safeId = track.id.toString().replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `track_${safeId}.mp3`;
      const fileUri = new File(Paths.document, fileName).uri;

      // Initialize progress
      if (reduxDispatch && reduxActions?.setDownloadProgress) {
        reduxDispatch(reduxActions.setDownloadProgress({
          trackId: track.id,
          progress: 0,
          status: 'downloading'
        }));
      }

      const token = await getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Create resumable download using legacy API (for progress support)
      const downloadResumable = FileSystemLegacy.createDownloadResumable(
        urlToDownload,
        fileUri,
        { headers },
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (reduxDispatch && reduxActions?.setDownloadProgress) {
            reduxDispatch(reduxActions.setDownloadProgress({
              trackId: track.id,
              progress,
              status: 'downloading'
            }));
          }
        }
      );

      activeResumables.set(track.id, downloadResumable);

      const downloadResult = await downloadResumable.downloadAsync();
      
      if (!downloadResult) throw new Error('Download failed');
      if (downloadResult.status !== 200) {
        try { new File(fileUri).delete(); } catch (_) {}
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      activeResumables.delete(track.id);

      // Save to metadata mapping
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      const metadata: Record<string, DownloadedTrack> = stored ? JSON.parse(stored) : {};

      const localFileUri = downloadResult.uri.startsWith('file://') 
        ? downloadResult.uri 
        : `file://${downloadResult.uri}`;

      // Get file size and validate it's a real audio file (not an error response)
      const file = new File(localFileUri);
      const fileInfo = await file.info();
      const fileSize = fileInfo.exists ? fileInfo.size : 0;

      // A real MP3 preview should be at least 10KB. Anything smaller is likely
      // a server error response (e.g. JSON auth error saved as .mp3)
      if (fileSize < 10240) {
        try { file.delete(); } catch (_) {}
        throw new Error('Downloaded file is too small — likely a server error response. Please try again.');
      }

      const downloadedTrack: DownloadedTrack = {
        ...track,
        duration: 30000, // Previews are 30s
        localUri: localFileUri,
        size: fileSize,
      };

      metadata[track.id] = downloadedTrack;
      await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(metadata));

      // Update Redux
      if (reduxDispatch && reduxActions) {
        if (reduxActions.upsertDownload) reduxDispatch(reduxActions.upsertDownload(downloadedTrack));
        if (reduxActions.clearDownloadProgress) reduxDispatch(reduxActions.clearDownloadProgress(track.id));
      }

    } catch (e: any) {
      console.error('Download failed:', e);
      activeResumables.delete(track.id);
      if (reduxDispatch && reduxActions?.setDownloadProgress) {
        reduxDispatch(reduxActions.setDownloadProgress({
          trackId: track.id,
          progress: 0,
          status: 'error',
          errorMessage: e.message
        }));
      }
      throw e;
    }
  },

  /**
   * Cancels an active download
   */
  cancelDownload: async (trackId: string): Promise<void> => {
    const resumable = activeResumables.get(trackId);
    if (resumable) {
      try {
        await resumable.pauseAsync(); // Pause then delete from map is equivalent to cancel
        activeResumables.delete(trackId);
        if (reduxDispatch && reduxActions?.clearDownloadProgress) {
          reduxDispatch(reduxActions.clearDownloadProgress(trackId));
        }

        // Try to delete the partially downloaded file to save space
        const safeId = trackId.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `track_${safeId}.mp3`;
        const uriToDelete = new File(Paths.document, fileName).uri;
        const file = new File(uriToDelete);
        const { exists } = await file.info();
        if (exists) {
            await file.delete();
        }
      } catch (e) {
        console.warn('Failed to cancel download:', e);
      }
    }
  },

  /**
   * Removes a track from physical storage and metadata
   */
  removeDownload: async (trackId: string): Promise<void> => {
    try {
      let trackToRemove = null;
      if (reduxGetState) {
        const state = reduxGetState();
        trackToRemove = state.downloads?.tracks?.[trackId];
      }

      let uriToDelete = trackToRemove?.localUri;
      if (!uriToDelete) {
        const safeId = trackId.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `track_${safeId}.mp3`;
        uriToDelete = new File(Paths.document, fileName).uri;
      }

      if (uriToDelete) {
        const normalizedUri = uriToDelete.startsWith('file://')
          ? uriToDelete
          : `file://${uriToDelete}`;
        const file = new File(normalizedUri);
        const { exists } = await file.info();
        if (exists) {
            await file.delete();
        }
      }

      // Update AsyncStorage
      const stored = await AsyncStorage.getItem(DOWNLOADS_KEY);
      if (stored) {
        const metadata: Record<string, DownloadedTrack> = JSON.parse(stored);
        delete metadata[trackId];
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(metadata));
      }

      // Update Redux
      if (reduxDispatch && reduxActions?.removeDownload) {
        reduxDispatch(reduxActions.removeDownload(trackId));
      }
    } catch (e) {
      console.error('Failed to remove download:', e);
      throw e;
    }
  }
};
