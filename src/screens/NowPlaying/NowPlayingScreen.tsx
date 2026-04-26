import React, { useRef, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Platform,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import { toggleLikeSongAction, addTrackToPlaylistAction } from "../../redux/store/library/librarySlice";
import { toggleShuffle, toggleRepeat } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import PlaylistPicker from "../../components/PlaylistPicker";
import { DownloadService } from "../../services/api/downloadService";
import PagerView from "react-native-pager-view";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from "react-native-reanimated";

// Slicing these into smaller components for better performance and clean code! 
import { AlbumArtCarousel } from "../../components/NowPlaying/AlbumArtCarousel";
import { TrackMetaInfo } from "../../components/NowPlaying/TrackMetaInfo";
import { ProgressBar } from "../../components/NowPlaying/ProgressBar";
import { PlaybackControls } from "../../components/NowPlaying/PlaybackControls";

/**
 * Professional Refactoring Note (Junior style):
 * I cleaned up this file! Now it's much shorter and easier to read.
 * Most of the "UI stuff" is in the components folder.
 * 
 * I also added 'useCallback' to functions. This stops them from being recreated
 * every time the component renders, which is great for performance!
 */

export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const player = useSelector((state: RootState) => state.player);
  const likedSongs = useSelector((state: RootState) => state.library.likedSongs);
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const downloadedTrackIds = useSelector((state: RootState) => state.downloads.downloadedTrackIds);

  const isLiked = player.currentTrack 
    ? likedSongs.some(t => t.id === player.currentTrack?.id) 
    : false;

  const isDownloaded = player.currentTrack
    ? downloadedTrackIds.includes(player.currentTrack.id)
    : false;

  const onToggleDownload = useCallback(async () => {
    if (!player.currentTrack) return;
    if (isDownloaded) {
      await DownloadService.removeDownload(player.currentTrack.id);
    } else {
      await DownloadService.downloadTrack(player.currentTrack);
    }
  }, [player.currentTrack, isDownloaded]);

  const pagerRef = useRef<PagerView>(null);

  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.2);

  useEffect(() => {
    if (player.isPlaying) {
      scale.value = withSpring(1.08, { damping: 10, stiffness: 80 });
      shadowOpacity.value = withTiming(0.4);
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      shadowOpacity.value = withTiming(0.2);
    }
  }, [player.isPlaying]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const currentIndex = player.currentTrack && player.queue.length > 0 
    ? player.queue.findIndex(t => t.id === player.currentTrack?.id) 
    : 0;
  const initialPageIndex = currentIndex !== -1 ? currentIndex : 0;

  useEffect(() => {
    if (player.currentTrack && pagerRef.current && player.queue.length > 0) {
      const idx = player.queue.findIndex(t => t.id === player.currentTrack?.id);
      if (idx !== -1) {
        pagerRef.current.setPage(idx);
      }
    }
  }, [player.currentTrack, player.queue]);

  const onPageSelected = useCallback(async (e: any) => {
    const newIdx = e.nativeEvent.position;
    if (player.queue.length === 0 || !player.queue[newIdx]) return;
    const track = player.queue[newIdx];
    if (track && track.id !== player.currentTrack?.id) {
      await audioPlayer.loadPlayTrack(track);
    }
  }, [player.queue, player.currentTrack]);

  const handleSeek = useCallback((value: number) => {
    audioPlayer.seek(value);
  }, []);

  const handleAddToPlaylist = useCallback((playlistId: string) => {
    if (player.currentTrack) {
      dispatch(addTrackToPlaylistAction({ 
        playlistId, 
        trackId: player.currentTrack.id 
      }));
      setIsPickerVisible(false);
    }
  }, [player.currentTrack, dispatch]);

  const onToggleLike = useCallback(() => {
    if (player.currentTrack) {
      dispatch(toggleLikeSongAction(player.currentTrack));
    }
  }, [player.currentTrack, dispatch]);

  const onToggleShuffle = useCallback(() => dispatch(toggleShuffle()), [dispatch]);
  const onToggleRepeat = useCallback(() => dispatch(toggleRepeat()), [dispatch]);
  const onPlayPause = useCallback(() => audioPlayer.playPause(), []);
  const onPrevious = useCallback(() => audioPlayer.playPrevious(), []);
  const onNext = useCallback(() => audioPlayer.playNext(), []);

  if (!player.currentTrack) return null;

  return (
    <View style={styles.container}>
      {/* Background Image with Blur */}
      <View style={StyleSheet.absoluteFill}>
         <Image 
          source={{ uri: player.currentTrack.image || "https://picsum.photos/400" }} 
          style={StyleSheet.absoluteFill}
          blurRadius={Platform.OS === 'ios' ? 70 : 20} 
        />
        <View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)' }
          ]} 
        />
      </View>

      <SafeAreaView style={styles.contentContainer}>
        {/* Header Overlay */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={26} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Playing Now</Text>
          <View style={styles.headerButton} /> 
        </View>

        {/* 1. Album Art Carousel */}
        <AlbumArtCarousel 
          queue={player.queue}
          currentTrack={player.currentTrack}
          pagerRef={pagerRef}
          initialPageIndex={initialPageIndex}
          onPageSelected={onPageSelected}
          animatedImageStyle={animatedImageStyle}
        />

        {/* 2. Track Meta Info (Title, Artist, Like, Playlist, Download) */}
        <TrackMetaInfo 
          track={player.currentTrack}
          isLiked={isLiked}
          isDownloaded={isDownloaded}
          onToggleLike={onToggleLike}
          onAddToPlaylist={() => setIsPickerVisible(true)}
          onToggleDownload={onToggleDownload}
          textColor={textColor}
        />

        {/* 3. Secondary Controls & Progress Bar */}
        <PlaybackControls 
          isPlaying={player.isPlaying}
          isShuffled={player.isShuffled}
          repeatMode={player.repeatMode}
          onToggleShuffle={onToggleShuffle}
          onToggleRepeat={onToggleRepeat}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          textColor={textColor}
        />

        {/* 4. Progress Bar Slider */}
        <ProgressBar 
          positionMillis={player.positionMillis}
          durationMillis={player.durationMillis}
          onSeek={handleSeek}
          textColor={textColor}
        />

        <PlaylistPicker 
          isVisible={isPickerVisible} 
          onClose={() => setIsPickerVisible(false)}
          onSelect={handleAddToPlaylist}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10, 
  },
  headerButton: {
    padding: 4,
    width: 40,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  }
});
