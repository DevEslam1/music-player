import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../../types";
import { store } from "../../redux/store/store";
import { setIsPlaying, setProgress, setCurrentTrack, setPlaybackError } from "../../redux/store/player/playerSlice";
import { LibraryService } from "../api/libraryService";
import { Platform } from "react-native";
import { DownloadService } from "../api/downloadService";
import { getAccessToken } from "../auth/session";

/**
 * Audio Player Service
 * Lock Screen Note (Expo SDK 55):
 * - Only play/pause, seek-forward (+10s), and seek-backward (-10s) are supported natively in expo-audio 55.
 * - Next/Previous track buttons are NOT available — the native MediaSession callback
 *   in expo-audio's Android implementation currently omits these actions.
 * - AudioPlaylist API is available but currently lacks native lock screen integration.
 */

const initAudioMode = async () => {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  } catch (e) {
    console.warn("Failed to set audio mode:", e);
  }
};

initAudioMode();

class AudioPlayerService {
  private static instance: AudioPlayerService;
  private player: AudioPlayer | null = null;
  private currentLoadingTrackId: string | null = null;
  private subscriptions: { remove: () => void }[] = [];
  private lastProgressDispatch = 0;

  private constructor() {}

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  public async loadPlayTrack(track: Track) {
    this.currentLoadingTrackId = track.id;

    try {
      store.dispatch(setCurrentTrack(track));
      this.lastProgressDispatch = 0;
      
      const token = await getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      await initAudioMode();

      // Check if we have a locally downloaded version of this track!
      const playerSource: any = {
        uri: track.previewUrl || track.uri,
        headers,
      };

      // Check if we have a locally downloaded version of this track.
      // getLocalUri() already verifies the file exists on disk — trust its result directly.
      // A second FileSystem.getInfoAsync call here used a different module import
      // (expo-file-system vs expo-file-system/legacy), which caused inconsistent URI
      // resolution and made the local check silently fail, falling back to streaming (broken offline).
      try {
        const localUri = await DownloadService.getLocalUri(track.id);
        if (localUri) {
          // Local playback: no headers — headers cause errors on file:// URIs
          playerSource.uri = localUri;
          delete playerSource.headers;
          console.log("📂 OFFLINE MODE: Playing local file:", localUri);
        } else if (playerSource.uri) {
          // No local file — stream (enforce HTTPS)
          playerSource.uri = playerSource.uri.replace(/^http:\/\//i, 'https://');
        }
      } catch(e) {
        console.warn("❌ OFFLINE CHECK FAILED:", e);
        if (playerSource.uri) playerSource.uri = playerSource.uri.replace(/^http:\/\//i, 'https://');
      }

      // expo-audio 55 AudioMetadata only supports: title, artist, albumTitle, artworkUrl
      const metadata = {
        title: track.name,
        artist: track.artist,
        albumTitle: "GiG Player",
        artworkUrl: track.image || "https://picsum.photos/400",
      };

      // expo-audio 55 AudioLockScreenOptions only supports showSeekForward and showSeekBackward.
      const options = {
        showSeekForward: true,
        showSeekBackward: true,
      };

      if (this.player) {
        // Seamlessly replace the audio source, keeping the foreground service & listener alive!
        // This is crucial for Android 12+ where re-creating foreground services from background is banned.
        this.player.replace(playerSource);
        this.player.updateLockScreenMetadata(metadata);
        
        if (this.currentLoadingTrackId !== track.id) {
          return;
        }
        
        this.player.play();
        store.dispatch(setIsPlaying(true));
      } else {
        const player = createAudioPlayer(playerSource);
        player.setActiveForLockScreen(true, metadata, options);

        if (this.currentLoadingTrackId !== track.id) {
          player.release();
          return;
        }

        this.player = player;

        this.subscriptions.push(this.player.addListener('playbackStatusUpdate', (status) => {
          if (status.playing !== undefined) {
            store.dispatch(setIsPlaying(status.playing));
            
            // Check latest track directly from store, not from closure!
            // When replace() is used, the closure's `track` object is stale.
            const state = store.getState().player;
            const activeTrack = state.currentTrack;
            const previewFallbackMs = activeTrack 
              ? Math.min((activeTrack.duration || 30000), 30000) 
              : 30000;

            const now = Date.now();

            if (now - this.lastProgressDispatch >= 500 || status.didJustFinish) {
              store.dispatch(setProgress({
                position: (status.currentTime || 0) * 1000,
                duration: (status.duration && status.duration > 1)
                  ? status.duration * 1000
                  : previewFallbackMs,
              }));
              this.lastProgressDispatch = now;
            }
          }

          if (status.didJustFinish) {
            this.playNext();
          }
        }));

        if (Platform.OS === 'android') {
          // expo-audio can race play() immediately after load on Android; keep the delay
          // until the upstream playback-start issue is resolved in the SDK/runtime.
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (this.currentLoadingTrackId === track.id && this.player) {
          this.player.play();
          store.dispatch(setIsPlaying(true));
        }
      }

      if (playerSource.uri && !playerSource.uri.startsWith('file://')) {
        LibraryService.logPlay(track.id).catch(e => console.warn("Failed to log play:", e));
      }

    } catch (e: any) {
      console.error("Audio Load Error:", e.message);
      store.dispatch(setPlaybackError(e.message));
    }
  }

  private async handleRemoteFavorite(track: Track) {
    try {
      await LibraryService.toggleLike(track.id);
    } catch (e) {
      console.warn("Failed to like song from remote:", e);
    }
  }

  public async playPause() {
    if (!this.player) return;
    const state = store.getState().player;
    if (state.isPlaying) {
      this.player.pause();
      store.dispatch(setIsPlaying(false));
    } else {
      this.player.play();
      store.dispatch(setIsPlaying(true));
    }
  }

  public async playNext() {
    const state = store.getState().player;
    if (!state.currentTrack || state.queue.length === 0) return;

    if (state.repeatMode === 'track') {
      await this.loadPlayTrack(state.currentTrack);
      return;
    }

    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'queue') {
        nextIndex = 0;
      } else {
        this.player?.pause();
        store.dispatch(setIsPlaying(false));
        return;
      }
    }

    let nextTrack = state.queue[nextIndex];
    if (state.isShuffled && state.queue.length > 1) {
      let randomIndex = currentIndex;
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * state.queue.length);
      }
      nextTrack = state.queue[randomIndex];
    }

    await this.loadPlayTrack(nextTrack);
  }

  public async playPrevious() {
    const state = store.getState().player;
    if (!state.currentTrack || state.queue.length === 0) return;

    if (state.positionMillis > 3000) {
      await this.seek(0);
      return;
    }

    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }

    await this.loadPlayTrack(state.queue[prevIndex]);
  }

  public async seek(positionMillis: number) {
    if (!this.player) return;
    this.player.seekTo(positionMillis / 1000); 
  }
}

export const audioPlayer = AudioPlayerService.getInstance();
