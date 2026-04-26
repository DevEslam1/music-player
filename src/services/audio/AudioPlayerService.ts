import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../../types";
import { store } from "../../redux/store/store";
import { setIsPlaying, setProgress, setCurrentTrack, toggleRepeat } from "../../redux/store/player/playerSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LibraryService } from "../api/libraryService";
import { Platform, Alert } from "react-native";


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
        (this.player as any).setActiveForLockScreen(false);
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


      let streamUrl = track.previewUrl || track.uri;
      if (streamUrl) {
        streamUrl = streamUrl.replace(/^http:\/\//i, 'https://');
      }

      console.log("🎵 Playing URL:", streamUrl);


      const player = createAudioPlayer({
        uri: streamUrl,
        headers,
      });

      (player as any).setActiveForLockScreen(true, {
        title: track.name,
        artist: track.artist,
        albumTitle: "GiG Player",
        artworkUrl: track.image || "https://picsum.photos/400",
      });


      if (this.currentLoadingTrackId !== track.id) {
        player.release();
        return;
      }

      this.player = player;


      this.subscriptions.push(this.player.addListener('playbackStatusUpdate', (status) => {
        if (status.playing !== undefined) {
          store.dispatch(setIsPlaying(status.playing));
          
          const fallbackDuration = (track.duration || 0) / 1000; 
          store.dispatch(setProgress({
            position: (status.currentTime || 0) * 1000,
            duration: (status.duration || fallbackDuration || 0) * 1000,
          }));
        }

        if (status.didJustFinish) {
          this.playNext();
        }
      }));

      
      this.subscriptions.push((this.player as any).addListener('playRequest', () => {
        console.log("Remote: Play Request");
        this.player?.play();
      }));

      this.subscriptions.push((this.player as any).addListener('pauseRequest', () => {
        console.log("Remote: Pause Request");
        this.player?.pause();
      }));

      this.subscriptions.push((this.player as any).addListener('nextTrackRequest', () => {
        console.log("Remote: Next Track Request");
        this.playNext();
      }));

      this.subscriptions.push((this.player as any).addListener('previousTrackRequest', () => {
        console.log("Remote: Previous Track Request");
        this.playPrevious();
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
