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
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withRepeat,
  withSequence,
  Easing,
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

  const currentIndex = player.currentTrack && player.queue.length > 0 
    ? player.queue.findIndex(t => t.id === player.currentTrack?.id) 
    : 0;

  // scale: starts at 0.9 for a subtle entrance effect
  const scale = useSharedValue(0.9);
  const shadowOpacity = useSharedValue(0.15);
  const breathe = useSharedValue(0); // 0→1 breathing offset when playing
  const glowIntensity = useSharedValue(0); // 0→1 drives the glow behind the artwork

  useEffect(() => {
    if (player.isPlaying) {
      // Bounce into playing state — bouncier spring than before
      scale.value = withSpring(1.08, { damping: 12, stiffness: 50 });
      shadowOpacity.value = withTiming(0.55, { duration: 400 });
      glowIntensity.value = withTiming(1, { duration: 600 });
      // Gentle breathe: ±1.5% scale oscillation every 2.4s
      breathe.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      // Shrink slightly when paused — makes the playing state feel much more alive
      scale.value = withSpring(0.93, { damping: 14, stiffness: 100 });
      shadowOpacity.value = withTiming(0.15, { duration: 400 });
      glowIntensity.value = withTiming(0, { duration: 400 });
      breathe.value = withTiming(0, { duration: 300 });
    }
  }, [player.isPlaying]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value + breathe.value * 0.015 }],
    shadowOpacity: shadowOpacity.value,
  }));

  const onTrackChange = useCallback(async (newIdx: number) => {
    if (player.queue.length === 0 || !player.queue[newIdx]) return;
    const track = player.queue[newIdx];
    if (track && track.id !== player.currentTrack?.id) {
      await audioPlayer.loadPlayTrack(track);
    }
  }, [player.queue, player.currentTrack, audioPlayer]);

  const isLiked = player.currentTrack 
    ? likedSongs.some(t => t.id === player.currentTrack?.id) 
    : false;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < player.queue.length - 1;

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
    <View style={[styles.container, { backgroundColor }]}>
      {/* Blurred Background */}
      <View style={StyleSheet.absoluteFill}>
        {player.currentTrack.image ? (
          <Image 
            source={{ uri: player.currentTrack.image }} 
            style={StyleSheet.absoluteFill}
            blurRadius={Platform.OS === 'ios' ? 80 : 30} 
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
        )}
        <View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)' }
          ]} 
        />
      </View>

      <SafeAreaView style={styles.contentContainer}>
        {/* Header Overlay */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Drawer')} 
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={26} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Playing Now</Text>
          <View style={styles.headerButton} /> 
        </View>

        {/* 1. Album Art Carousel */}
        <AlbumArtCarousel 
          queue={player.queue}
          currentTrack={player.currentTrack}
          currentIndex={currentIndex}
          onTrackChange={onTrackChange}
          animatedImageStyle={animatedImageStyle}
          glowIntensity={glowIntensity}
        />

        {/* 2. Track Meta Info (Title, Artist, Like, Playlist, Download) */}
        <TrackMetaInfo 
          track={player.currentTrack}
          isLiked={isLiked}
          onToggleLike={onToggleLike}
          onAddToPlaylist={() => setIsPickerVisible(true)}
          textColor={textColor}
        />

        {/* 3. Secondary Controls & Progress Bar */}
        <PlaybackControls 
          isPlaying={player.isPlaying}
          isShuffled={player.isShuffled}
          repeatMode={player.repeatMode}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
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
    backgroundColor: '#1a1a2e',
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
