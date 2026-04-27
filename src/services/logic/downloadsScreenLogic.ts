import { useCallback, useMemo } from "react";
import { DownloadService } from "../api/downloadService";
import { store } from "../../redux/store/store";
import { setCurrentTrack, setQueue, setIsPlaying } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { Track } from "../../types";

export function downloadsScreenLogic() {
  const tracksRecord = useSelector((state: RootState) => state.downloads.tracks);
  
  // Transform Record to Array and sort by name (optional, but good for UX)
  const downloadedTracks = useMemo(() => {
    return Object.values(tracksRecord).sort((a, b) => a.name.localeCompare(b.name));
  }, [tracksRecord]);

  const totalStorage = useMemo(() => {
    return downloadedTracks.reduce((acc, t) => acc + (t.size || 0), 0);
  }, [downloadedTracks]);

  const loading = false; // No longer needed since Redux is hydrated on startup

  const handlePlayTrack = useCallback(async (track: Track) => {
    store.dispatch(setQueue(downloadedTracks));
    store.dispatch(setCurrentTrack(track));
    
    try {
      await audioPlayer.loadPlayTrack(track);
    } catch (e) {
      console.error("Failed to play track:", e);
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
            try {
              await DownloadService.removeDownload(trackId);
            } catch (e: any) {
              Alert.alert("Error", "Failed to remove download: " + e.message);
            }
          }
        }
      ]
    );
  }, []);

  const handleDeleteAll = useCallback(async () => {
    if (downloadedTracks.length === 0) return;
    
    Alert.alert(
      "Delete All",
      `Are you sure you want to delete all ${downloadedTracks.length} downloaded tracks?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: async () => {
            for (const track of downloadedTracks) {
              await DownloadService.removeDownload(track.id);
            }
          }
        }
      ]
    );
  }, [downloadedTracks]);

  return {
    downloadedTracks,
    loading,
    handlePlayTrack,
    handleDeleteDownload,
    handleDeleteAll,
    totalStorage
  };
}
