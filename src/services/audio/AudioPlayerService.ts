import TrackPlayer, { 
  Capability, 
  Event, 
  State as PlayerState,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode
} from "react-native-track-player";
import { Track } from "../../types";
import { Platform, NativeModules } from "react-native";
const { TrackPlayerModule } = NativeModules;
import { DownloadService } from "../api/downloadService";
import { getAccessToken } from "../auth/session";
import { LocalMusicService } from "../local/localMusicService";
import { LocalTrack } from "../../types";
import { LibraryService } from "../api/libraryService";
import { Image } from "expo-image";

/**
 * Audio Player Service (Refactored to react-native-track-player)
 * - Full Lock Screen controls (Next, Previous, Play, Pause, Seek)
 * - Native Media Session integration
 * - Background playback stability
 */

class AudioPlayerService {
  private static instance: AudioPlayerService;
  private isInitialized = false;
  private setupPromise: Promise<void> | null = null;
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
    setEqualizerSettings?: (settings: any) => void;
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
      setEqualizerSettings?: (settings: any) => void;
    }
  ) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.actions = actions;
    
    // Once Redux is injected, we can start the initialization
    this.setupPlayer().catch(e => console.error("Failed to setup TrackPlayer:", e));
  }

  private async setupPlayer() {
    if (this.setupPromise) return this.setupPromise;

    this.setupPromise = (async () => {
      try {
        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        });
      } catch (e: any) {
        // If it's already initialized, we don't treat it as a hard error
        if (e.message?.includes('already been initialized')) {
          console.log("TrackPlayer already initialized, skipping setup.");
        } else {
          this.setupPromise = null; // Allow retry on real errors
          throw e;
        }
      }

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          alwaysPauseOnInterruption: true,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
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
          Capability.Stop,
        ],
      });

      this.setupListeners();
      this.isInitialized = true;
    })();

    return this.setupPromise;
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
              }).catch(() => {});
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

      this.prefetchNextTracks();

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

  public async playNext(): Promise<void> {
    const state = this.getState?.().player;
    if (!state || state.queue.length === 0) return;
    
    const currentIndex = state.currentTrack ? state.queue.findIndex((t: Track) => t.id === state.currentTrack?.id) : -1;
    let nextIndex = currentIndex + 1;

    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'queue') {
        nextIndex = 0;
      } else {
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

  private prefetchNextTracks() {
    const state = this.getState?.().player;
    if (!state || !state.currentTrack || state.queue.length === 0) return;

    const currentIndex = state.queue.findIndex((t: Track) => t.id === state.currentTrack?.id);
    if (currentIndex === -1) return;

    // Prefetch next 3 tracks
    const nextTracks = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (currentIndex + i) % state.queue.length;
      const track = state.queue[nextIndex];
      if (track?.image) {
        nextTracks.push(track.image);
      }
    }

    if (nextTracks.length > 0) {
      Image.prefetch(nextTracks);
    }
  }

  // ─── Equalizer API ──────────────────────────────────────────────────────────

  public async isEqualizerAvailable(): Promise<boolean> {
    return Platform.OS === 'android';
  }

  public async setEqualizerEnabled(enabled: boolean): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      const success = await TrackPlayerModule.setEqualizerEnabled(enabled);
      if (success) {
        this.dispatch?.(this.actions?.setEqualizerSettings?.({ enabled }));
      }
      return success;
    } catch (e) {
      console.error('EQ Error:', e);
      return false;
    }
  }

  public async getEqualizerBands(): Promise<{ count: number, bands: number[], levels: number[], min: number, max: number }> {
    if (Platform.OS !== 'android') return { count: 0, bands: [], levels: [], min: 0, max: 0 };
    try {
      const data = await TrackPlayerModule.getEqualizerBands();
      const bands: number[] = [];
      const levels: number[] = [];
      for (let i = 0; i < data.count; i++) {
        bands.push(data[`band_${i}`]);
        levels.push(data[`level_${i}`]);
      }
      return {
        count: data.count,
        bands,
        levels,
        min: data.min,
        max: data.max
      };
    } catch (e) {
      return { count: 0, bands: [], levels: [], min: 0, max: 0 };
    }
  }

  public async setEqualizerBandLevel(band: number, level: number): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      await TrackPlayerModule.setEqualizerBandLevel(band, level);
      const currentLevels = [...(this.getState?.().player.equalizerSettings.bandLevels || [0,0,0,0,0])];
      currentLevels[band] = level;
      this.dispatch?.(this.actions?.setEqualizerSettings?.({ bandLevels: currentLevels, currentPreset: null }));
    } catch (e) {}
  }

  public async getEqualizerPresets(): Promise<string[]> {
    if (Platform.OS !== 'android') return [];
    try {
      return await TrackPlayerModule.getEqualizerPresets();
    } catch (e) {
      return [];
    }
  }

  public async applyEqualizerPreset(index: number, name: string): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      await TrackPlayerModule.applyEqualizerPreset(index);
      
      // Fetch new levels after preset change
      const data = await this.getEqualizerBands();
      this.dispatch?.(this.actions?.setEqualizerSettings?.({ 
        currentPreset: name,
        bandLevels: data.levels 
      }));
    } catch (e) {}
  }

  public async restoreEqualizerSettings(settings: { enabled: boolean, bandLevels: number[], currentPreset: string | null }): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      // 1. Enable/Disable
      await TrackPlayerModule.setEqualizerEnabled(settings.enabled);
      
      if (settings.enabled) {
        // 2. Apply bands
        for (let i = 0; i < settings.bandLevels.length; i++) {
          await TrackPlayerModule.setEqualizerBandLevel(i, settings.bandLevels[i]);
        }
        
        // 3. Apply preset if it exists (though levels might already be set)
        if (settings.currentPreset) {
          const presets = await this.getEqualizerPresets();
          const index = presets.indexOf(settings.currentPreset);
          if (index !== -1) {
            // Note: Applying preset might overwrite the custom band levels above,
            // so we do it in this order or just trust the levels.
            // Usually, if there's a preset name, we should apply it first then the levels if they are custom.
          }
        }
      }
    } catch (e) {
      console.warn("Failed to restore EQ settings:", e);
    }
  }
}

export const audioPlayer = AudioPlayerService.getInstance();
