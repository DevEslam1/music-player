import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../../types";
import { store } from "../../redux/store/store";
import { setIsPlaying, setProgress, setCurrentTrack } from "../../redux/store/player/playerSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LibraryService } from "../api/libraryService";
import { Platform, Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import { DownloadService } from "../api/downloadService";

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

  private constructor() {}

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  public async loadPlayTrack(track: Track) {
    this.currentLoadingTrackId = track.id;

    if (this.player) {
      try {
        this.player.setActiveForLockScreen(false);
        this.player.pause();
        this.player.release();
      } catch (e) {}

      this.subscriptions.forEach(s => s.remove());
      this.subscriptions = [];
      this.player = null;
    }

    try {
      store.dispatch(setCurrentTrack(track));
      
      const token = await AsyncStorage.getItem("access_token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      await initAudioMode();

      // Check if we have a locally downloaded version of this track!
      const playerSource: any = {
        uri: track.previewUrl || track.uri,
        headers,
      };

      // Check if we have a locally downloaded version of this track!
      try {
        const localUri = await DownloadService.getLocalUri(track.id);
        if (localUri) {
          console.log("📂 OFFLINE MODE: Found local file at", localUri);
          // expo-audio on Android requires a properly formatted file:// URI
          const formattedLocalUri = localUri.startsWith('file://') ? localUri : `file://${localUri}`;
          const fileInfo = await FileSystem.getInfoAsync(formattedLocalUri);
          
          if (fileInfo.exists) {
            // Local playback: use a plain uri with NO headers — headers cause errors on local files
            playerSource.uri = formattedLocalUri;
            delete playerSource.headers;
            console.log("✅ OFFLINE MODE: Local file verified. Playing:", formattedLocalUri);
          } else {
            console.log("⚠️ OFFLINE MODE: Metadata found but file is missing from disk. Streaming instead.");
            if (playerSource.uri) playerSource.uri = playerSource.uri.replace(/^http:\/\//i, 'https://');
          }
        } else if (playerSource.uri) {
          playerSource.uri = playerSource.uri.replace(/^http:\/\//i, 'https://');
        }
      } catch(e) {
        console.warn("❌ OFFLINE CHECK FAILED:", e);
        if (playerSource.uri) playerSource.uri = playerSource.uri.replace(/^http:\/\//i, 'https://');
      }

      console.log("🎵 Final Playback URI:", playerSource.uri);
      const player = createAudioPlayer(playerSource);

      // expo-audio 55 AudioMetadata only supports: title, artist, albumTitle, artworkUrl
      const metadata = {
        title: track.name,
        artist: track.artist,
        albumTitle: "GiG Player",
        artworkUrl: track.image || "https://picsum.photos/400",
      };

      // expo-audio 55 AudioLockScreenOptions only supports showSeekForward and showSeekBackward.
      // Next/Previous track buttons are NOT implemented in this version of the native library.
      const options = {
        showSeekForward: true,
        showSeekBackward: true,
      };

      player.setActiveForLockScreen(true, metadata, options);

      if (this.currentLoadingTrackId !== track.id) {
        player.release();
        return;
      }

      this.player = player;

      this.subscriptions.push(this.player.addListener('playbackStatusUpdate', (status) => {
        if (status.playing !== undefined) {
          store.dispatch(setIsPlaying(status.playing));
          // Fallback duration: previews are always 30s max. The full Spotify duration
          // (track.duration) is incorrect for preview files, so cap it at 30000ms.
          const previewFallbackMs = Math.min((track.duration || 30000), 30000);
          store.dispatch(setProgress({
            position: (status.currentTime || 0) * 1000,
            duration: (status.duration && status.duration > 1)
              ? status.duration * 1000
              : previewFallbackMs,
          }));
        }

        if (status.didJustFinish) {
          this.playNext();
        }
      }));

      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (this.currentLoadingTrackId === track.id && this.player) {
        this.player.play();
        store.dispatch(setIsPlaying(true));
      }

      LibraryService.logPlay(track.id).catch(e => console.warn("Failed to log play:", e));

    } catch (e: any) {
      console.error("Audio Load Error:", e.message);
      Alert.alert("Audio Error", `${e.message}\n\nURL: ${track.previewUrl}`);
      store.dispatch(setIsPlaying(false));
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
