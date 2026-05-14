import TrackPlayer, { 
  Capability, 
  Event, 
  State as PlayerState,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode
} from "react-native-track-player";
import { Track } from "../../types";
import { Platform } from "react-native";
import { DownloadService } from "../api/downloadService";
import { getAccessToken } from "../auth/session";
import { LocalMusicService } from "../local/localMusicService";
import { LocalTrack } from "../../types";
import { LibraryService } from "../api/libraryService";

/**
 * Audio Player Service (Refactored to react-native-track-player)
 * - Full Lock Screen controls (Next, Previous, Play, Pause, Seek)
 * - Native Media Session integration
 * - Background playback stability
 */

class AudioPlayerService {
  private static instance: AudioPlayerService;
  private isInitialized = false;
  private currentLoadingTrackId: string | null = null;
  private lastProgressDispatch = 0;

  // Injected Redux dependencies to avoid cycles
  private dispatch: any = null;
  private getState: any = null;
  private actions: { 
    setIsPlaying: any;
    setProgress: any;
    setCurrentTrack: any;
    setPlaybackError?: (error: string | null) => void;
    updateTracks?: (tracks: Track[]) => void;
    setSleepTimer?: (time: number | null) => void;
    addTrackToHistory?: (track: Track) => void;
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
      setPlaybackError?: (error: string | null) => void;
      updateTracks?: (tracks: Track[]) => void;
      setSleepTimer?: (time: number | null) => void;
      addTrackToHistory?: (track: Track) => void;
    }
  ) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.actions = actions;
    
    // Once Redux is injected, we can start the initialization
    this.setupPlayer().catch(e => console.error("Failed to setup TrackPlayer:", e));
  }

  private async setupPlayer() {
    if (this.isInitialized) return;

    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
      });

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
      });

      this.setupListeners();
      this.isInitialized = true;
    } catch (e) {
      console.error("TrackPlayer setup error:", e);
    }
  }

  private setupListeners() {
    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
      const isPlaying = state === PlayerState.Playing;
      this.dispatch?.(this.actions?.setIsPlaying(isPlaying));
    });

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, ({ track }) => {
      if (track && track.id !== this.getState?.().player.currentTrack?.id) {
        // Find track in our original queue to get the full object
        const originalTrack = this.getState?.().player.queue.find((t: Track) => t.id === track.id);
        if (originalTrack) {
          this.dispatch?.(this.actions?.setCurrentTrack(originalTrack));
        }
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
      this.playNext();
    });

    // We still need a progress sync for things like the sleep timer
    // but the UI will use useProgress() hook directly.
    setInterval(async () => {
      if (!this.isInitialized) return;
      const state = await TrackPlayer.getPlaybackState();
      if (state.state !== PlayerState.Playing) return;

      const progress = await TrackPlayer.getProgress();
      const now = Date.now();
      const playerState = this.getState?.().player;

      // Sleep timer logic
      if (playerState?.sleepTimerEndAt && now >= playerState.sleepTimerEndAt) {
        await TrackPlayer.pause();
        this.dispatch?.(this.actions?.setSleepTimer(null));
        return;
      }

      // Progress sync (less frequent than UI)
      if (now - this.lastProgressDispatch >= 1000) {
        this.dispatch?.(this.actions?.setProgress({
          position: progress.position * 1000,
          duration: progress.duration * 1000,
        }));
        this.lastProgressDispatch = now;
      }
    }, 1000);
  }

  public async loadPlayTrack(track: Track) {
    if (!this.isInitialized) await this.setupPlayer();
    
    this.currentLoadingTrackId = track.id;

    // Log to Redux
    if (this.actions?.setCurrentTrack) {
      this.dispatch?.(this.actions.setCurrentTrack(track));
    }
    
    // Add to history
    if (this.actions?.addTrackToHistory) {
      this.dispatch?.(this.actions.addTrackToHistory(track));
    }

    try {
      this.lastProgressDispatch = 0;
      
      const token = await getAccessToken();
      const isLocalFile =
        (track.uri ?? "").startsWith("file://") ||
        (track.previewUrl ?? "").startsWith("file://");
      
      const headers: Record<string, string> =
        !isLocalFile && token ? { Authorization: `Bearer ${token}` } : {};

      let sourceUri = track.previewUrl || track.uri;

      // Check local cache
      try {
        const localUri = await DownloadService.getLocalUri(track.id);
        if (localUri) {
          sourceUri = localUri;
          console.log("📂 OFFLINE MODE: Playing local file:", localUri);
        } else if (sourceUri) {
          sourceUri = sourceUri.replace(/^http:\/\//i, 'https://');
        }
      } catch(e) {
        console.warn("❌ OFFLINE CHECK FAILED:", e);
        if (sourceUri) sourceUri = sourceUri.replace(/^http:\/\//i, 'https://');
      }

      // If local track and no image, enrich it on the fly!
      if (isLocalFile && !track.image && this.dispatch && this.actions && this.getState) {
        LocalMusicService.enrichMetadata([track as LocalTrack]).then(enriched => {
          if (enriched.length > 0 && enriched[0].image) {
            const enrichedTrack = enriched[0];
            this.dispatch!(this.actions!.updateTracks!([enrichedTrack]));
            
            if (this.getState().player.currentTrack?.id === enrichedTrack.id) {
              this.dispatch!(this.actions!.setCurrentTrack(enrichedTrack));
              TrackPlayer.updateMetadataForTrack(0, {
                artwork: enrichedTrack.image,
              });
            }
          }
        }).catch(() => {});
      }

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.id,
        url: sourceUri!,
        title: track.name,
        artist: track.artist,
        album: track.album || "GiG Player",
        artwork: track.image || undefined,
        headers: !sourceUri?.startsWith('file://') ? headers : undefined,
      });

      await TrackPlayer.play();
      
      if (sourceUri && !sourceUri.startsWith('file://')) {
        LibraryService.logPlay(track.id).catch(e => console.warn("Failed to log play:", e));
      }

    } catch (e: any) {
      console.error("Audio Load Error:", e.message);
      this.dispatch?.(this.actions?.setPlaybackError(e.message));
    }
  }

  public async playPause() {
    if (!this.isInitialized) return;
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === PlayerState.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }

  public async playNext() {
    const state = this.getState?.().player;
    if (!state.currentTrack || state.queue.length === 0) return;

    const currentIndex = state.queue.findIndex((t: Track) => t.id === state.currentTrack?.id);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'queue') {
        nextIndex = 0;
      } else {
        await TrackPlayer.pause();
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

    const progress = await TrackPlayer.getProgress();
    if (progress.position > 3) {
      await TrackPlayer.seekTo(0);
      return;
    }

    const currentIndex = state.queue.findIndex((t: Track) => t.id === state.currentTrack?.id);
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }

    await this.loadPlayTrack(state.queue[prevIndex]);
  }

  public async seek(positionMillis: number) {
    if (!this.isInitialized) return;
    await TrackPlayer.seekTo(positionMillis / 1000); 
  }

  public async setVolume(volume: number) {
    if (!this.isInitialized) return;
    await TrackPlayer.setVolume(Math.max(0, Math.min(1, volume)));
  }

  public async setRepeatMode(mode: 'none' | 'queue' | 'track') {
    if (!this.isInitialized) return;
    const tpMode = mode === 'track' ? TrackPlayerRepeatMode.Track : mode === 'queue' ? TrackPlayerRepeatMode.Queue : TrackPlayerRepeatMode.Off;
    await TrackPlayer.setRepeatMode(tpMode);
  }
}

export const audioPlayer = AudioPlayerService.getInstance();
