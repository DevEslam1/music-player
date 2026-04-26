import { useState, useCallback, useEffect } from "react";
import { DownloadService, DownloadedTrack } from "../api/downloadService";
import { store } from "../../redux/store/store";
import { setCurrentTrack, setQueue, setIsPlaying } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

export function downloadsScreenLogic() {
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch downloaded tracks when the global Redux state changes (i.e. someone removed/added a download)
  const downloadedTrackIds = useSelector((state: RootState) => state.downloads.downloadedTrackIds);

  const fetchDownloads = useCallback(async () => {
    setLoading(true);
    try {
      const tracks = await DownloadService.getDownloadedTracks();
      setDownloadedTracks(tracks);
    } catch (e) {
      console.error("Failed to load downloads:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [downloadedTrackIds, fetchDownloads]);

  const handlePlayTrack = useCallback(async (track: DownloadedTrack) => {
    store.dispatch(setQueue(downloadedTracks));
    store.dispatch(setCurrentTrack(track));
    store.dispatch(setIsPlaying(true));

    try {
      await audioPlayer.loadPlayTrack(track);
    } catch (e) {
      console.error("Failed to play track:", e);
      store.dispatch(setIsPlaying(false));
    }
  }, [downloadedTracks]);

  const handleDeleteDownload = useCallback(async (trackId: string) => {
    Alert.alert(
      "Remove Download",
      "Are you sure you want to delete this track from your device?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await DownloadService.removeDownload(trackId);
          }
        }
      ]
    );
  }, []);

  return {
    downloadedTracks,
    loading,
    handlePlayTrack,
    handleDeleteDownload
  };
}
