import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../../types";
import { store } from "../../redux/store/store";
import { setIsPlaying, setProgress, setCurrentTrack, toggleRepeat } from "../../redux/store/player/playerSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure audio mode once at module load
setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'doNotMix',
});

class AudioPlayerService {
  private static instance: AudioPlayerService;
  private player: AudioPlayer | null = null;
  private currentLoadingTrackId: string | null = null;
  private statusSubscription: { remove: () => void } | null = null;

  private constructor() {}

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  public async loadPlayTrack(track: Track) {
    this.currentLoadingTrackId = track.id;

    // 1. Release any existing player
    if (this.player) {
      try {
        this.player.pause();
        this.player.release();
      } catch (e) {
        // Ignore errors during cleanup
      }
      this.statusSubscription?.remove();
      this.player = null;
      this.statusSubscription = null;
    }

    try {
      store.dispatch(setCurrentTrack(track));
      
      // 2. Retrieve token for authenticated playback
      const token = await AsyncStorage.getItem("access_token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 3. Create new player with the track URL and headers
      const player = createAudioPlayer({
        uri: track.previewUrl,
        headers
      });

      // 3. Race condition check
      if (this.currentLoadingTrackId !== track.id) {
        player.release();
        return;
      }

      this.player = player;

      // 4. Subscribe to playback status updates
      this.statusSubscription = this.player.addListener('playbackStatusUpdate', (status) => {
        if (status.playing !== undefined) {
          store.dispatch(setProgress({
            position: (status.currentTime || 0) * 1000,  // seconds → ms
            duration: (status.duration || 30) * 1000,
          }));
        }

        // Auto-play next when track finishes
        if (status.didJustFinish) {
          this.playNext();
        }
      });

      // 5. Start playback
      this.player.play();
      store.dispatch(setIsPlaying(true));
    } catch (e: any) {
      console.error("Audio Load Error Details:", {
        message: e.message,
        trackId: track.id,
        trackUrl: track.previewUrl,
        error: e
      });
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
      await this.seek(0);
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
    if (state.isShuffled) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
      nextTrack = state.queue[nextIndex];
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
    this.player.seekTo(positionMillis / 1000); // ms → seconds (expo-audio uses seconds)
  }
}

export const audioPlayer = AudioPlayerService.getInstance();
