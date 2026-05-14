import TrackPlayer, { Event } from 'react-native-track-player';
import { audioPlayer } from './AudioPlayerService';

/**
 * This service is registered to handle remote control events in the background.
 * react-native-track-player requires this to be a standalone module.
 */
export const PlaybackService = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('🎧 PlaybackService: RemotePlay');
    audioPlayer.playPause();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    audioPlayer.playPause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    audioPlayer.playNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    audioPlayer.playPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    audioPlayer.seek(event.position * 1000);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.reset();
  });
};
