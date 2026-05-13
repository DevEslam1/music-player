import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../../types";
import { Platform } from "react-native";
import { DownloadService } from "../api/downloadService";
import { getAccessToken } from "../auth/session";
import { LocalMusicService } from "../local/localMusicService";
import { LocalTrack } from "../../types";
import { LibraryService } from "../api/libraryService";

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

  // Injected Redux dependencies to avoid cycles
  private dispatch: any = null;
  private getState: any = null;
  private actions: { 
    setIsPlaying: any;
    setProgress: any;
    setCurrentTrack: any;
    setPlaybackError: any;
    updateTracks: any;
  } | null = null;

  private constructor() {}

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  /**
   * Inject Redux dispatch and actions to avoid circular dependencies
   */
  public injectRedux(
    dispatch: any, 
    getState: any, 
    actions: { 
      setIsPlaying: any;
      setProgress: any;
      setCurrentTrack: any;
      setPlaybackError: any;
      updateTracks: any;
    }
  ) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.actions = actions;
  }

  public async loadPlayTrack(track: Track) {
    this.currentLoadingTrackId = track.id;

    try {
      this.dispatch?.(this.actions?.setCurrentTrack(track));
      this.lastProgressDispatch = 0;
      
      const token = await getAccessToken();
      const isLocalFile =
        (track.uri ?? "").startsWith("file://") ||
        (track.previewUrl ?? "").startsWith("file://");
      const headers: Record<string, string> =
        !isLocalFile && token ? { Authorization: `Bearer ${token}` } : {};

      await initAudioMode();

      // Check if we have a locally downloaded version of this track!
      const playerSource: any = {
        uri: track.previewUrl || track.uri,
      };

      // Only attach headers if they are non-empty and it's not a local file
      if (Object.keys(headers).length > 0 && !isLocalFile) {
        playerSource.headers = headers;
      }

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
      const metadata = this.sanitizeMetadata({
        title: track.name,
        artist: track.artist,
        albumTitle: track.album || "GiG Player",
        artworkUrl: track.image || undefined,
      });

      // If local track and no image, enrich it on the fly!
      if (isLocalFile && !track.image && this.dispatch && this.actions && this.getState) {
        LocalMusicService.enrichMetadata([track as LocalTrack]).then(enriched => {
          if (enriched.length > 0 && enriched[0].image) {
            const enrichedTrack = enriched[0];
            this.dispatch(this.actions.updateTracks([enrichedTrack]));
            
            // Also update current track in player if it's still the same one
            if (this.getState().player.currentTrack?.id === enrichedTrack.id) {
              this.dispatch(this.actions.setCurrentTrack(enrichedTrack));
              try {
                this.player?.updateLockScreenMetadata(this.sanitizeMetadata({
                  title: enrichedTrack.name,
                  artist: enrichedTrack.artist,
                  albumTitle: enrichedTrack.album || "GiG Player",
                  artworkUrl: enrichedTrack.image,
                }));
              } catch (e) {
                console.warn("Failed to update enriched metadata on lockscreen:", e);
              }
            }
          }
        }).catch(() => {});
      }

      // expo-audio 55 AudioLockScreenOptions only supports showSeekForward and showSeekBackward.
      const options = {
        showSeekForward: true,
        showSeekBackward: true,
      };

      if (this.player) {
        // Seamlessly replace the audio source, keeping the foreground service & listener alive!
        // This is crucial for Android 12+ where re-creating foreground services from background is banned.
        this.player.replace(playerSource);
        try {
          this.player.updateLockScreenMetadata(metadata);
        } catch (e) {
          console.warn("Failed to update lockscreen metadata:", e);
        }
        
        if (this.currentLoadingTrackId !== track.id) {
          return;
        }
        
        this.player.play();
        this.dispatch?.(this.actions?.setIsPlaying(true));
      } else {
        const player = createAudioPlayer(playerSource);
        try {
          player.setActiveForLockScreen(true, metadata, options);
        } catch (e) {
          console.warn("Failed to activate lockscreen metadata:", e);
        }

        if (this.currentLoadingTrackId !== track.id) {
          player.release();
          return;
        }

        this.player = player;

        this.subscriptions.push(this.player.addListener('playbackStatusUpdate', (status) => {
          if (status.playing !== undefined) {
            this.dispatch?.(this.actions?.setIsPlaying(status.playing));
            
            // Check latest track directly from state
            const state = this.getState?.().player;
            const activeTrack = state.currentTrack;
            const previewFallbackMs = activeTrack 
              ? Math.min((activeTrack.duration || 30000), 30000) 
              : 30000;

            const now = Date.now();

            if (now - this.lastProgressDispatch >= 500 || status.didJustFinish) {
              this.dispatch?.(this.actions?.setProgress({
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
          this.dispatch?.(this.actions?.setIsPlaying(true));
        }
      }

      if (playerSource.uri && !playerSource.uri.startsWith('file://')) {
        LibraryService.logPlay(track.id).catch(e => console.warn("Failed to log play:", e));
      }

    } catch (e: any) {
      console.error("Audio Load Error:", e.message);
      this.dispatch?.(this.actions?.setPlaybackError(e.message));
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
    const state = this.getState?.().player;
    if (state.isPlaying) {
      this.player.pause();
      this.dispatch?.(this.actions?.setIsPlaying(false));
    } else {
      this.player.play();
      this.dispatch?.(this.actions?.setIsPlaying(true));
    }
  }

  public async playNext() {
    const state = this.getState?.().player;
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
        this.dispatch?.(this.actions?.setIsPlaying(false));
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
    const state = this.getState?.().player;
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

  /**
   * Sanitizes metadata for native lockscreen consumption.
   * Android MediaSession can reject metadata if base64 artwork is too large.
   */
  private sanitizeMetadata(metadata: any) {
    // If artwork is a data URI, check its size. 
    // Android MediaMetadata has a limit on the total bundle size (often ~100KB-500KB).
    // Large base64 strings will cause the native call to be rejected.
    if (metadata.artworkUrl?.startsWith('data:') && metadata.artworkUrl.length > 200000) {
      console.log("⚠️ Metadata artwork too large for lockscreen, omitting base64 data");
      return { ...metadata, artworkUrl: undefined };
    }
    return metadata;
  }
}

export const audioPlayer = AudioPlayerService.getInstance();
