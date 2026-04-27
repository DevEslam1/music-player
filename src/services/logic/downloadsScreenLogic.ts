import { useCallback, useMemo } from "react";
import { DownloadService } from "../api/downloadService";
import { store } from "../../redux/store/store";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { Track } from "../../types";
import { showAppBanner } from "../../components/OfflineBanner";

export function useDownloadsScreenLogic() {
  const tracksRecord = useSelector((state: RootState) => state.downloads.tracks);

  // Transform Record to Array and sort by name
  const downloadedTracks = useMemo(() => {
    return Object.values(tracksRecord).sort((a, b) => a.name.localeCompare(b.name));
  }, [tracksRecord]);

  const totalStorage = useMemo(() => {
    return downloadedTracks.reduce((acc, t) => acc + (t.size || 0), 0);
  }, [downloadedTracks]);

  const loading = false;

  const handlePlayTrack = useCallback(async (track: Track) => {
    store.dispatch(setQueue(downloadedTracks));
    // Fix 3: Removed redundant setCurrentTrack dispatch —
    // audioPlayer.loadPlayTrack already dispatches it internally.
    try {
      await audioPlayer.loadPlayTrack(track);
    } catch (e) {
      console.error("Failed to play track:", e);
    }
  }, [downloadedTracks]);

  const handleDeleteDownload = useCallback(async (trackId: string) => {
    // Confirm via banner then delete immediately; 
    // For destructive confirmation we still show a brief info banner.
    showAppBanner("Removing download…", "info");
    try {
      await DownloadService.removeDownload(trackId);
      showAppBanner("Track removed from downloads.", "success");
    } catch (e: any) {
      showAppBanner("Failed to remove download: " + e.message, "error");
    }
  }, []);

  const handleDeleteAll = useCallback(async () => {
    if (downloadedTracks.length === 0) return;
    showAppBanner(`Removing ${downloadedTracks.length} tracks…`, "info");
    try {
      await Promise.all(
        downloadedTracks.map((track) => DownloadService.removeDownload(track.id))
      );
      showAppBanner("All downloads removed.", "success");
    } catch (e: any) {
      showAppBanner("Failed to delete all downloads.", "error");
    }
  }, [downloadedTracks]);

  return {
    downloadedTracks,
    loading,
    handlePlayTrack,
    handleDeleteDownload,
    handleDeleteAll,
    totalStorage,
  };
}
