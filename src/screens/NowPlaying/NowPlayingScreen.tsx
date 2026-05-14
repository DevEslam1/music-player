import { Image } from "expo-image";
import React, { useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from "react-native";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useColorScheme, useAccentColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import { toggleLikeSongAction, addTrackToPlaylistAction } from "../../redux/store/library/librarySlice";
import { toggleShuffle, toggleRepeat, setSleepTimer } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import PlaylistPicker from "../../components/PlaylistPicker";
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
import { ProgressBar } from "../../components/NowPlaying/ProgressBar";
import { PlaybackControls } from "../../components/NowPlaying/PlaybackControls";
import { DownloadButton } from "../../components/DownloadButton";
import { SleepTimerModal } from "../../components/settings/SleepTimerModal";
import { setShowLyrics, showBanner } from "../../redux/store/ui/uiSlice";



export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const queue = useSelector((state: RootState) => state.player.queue);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const isShuffled = useSelector((state: RootState) => state.player.isShuffled);
  const repeatMode = useSelector((state: RootState) => state.player.repeatMode);
  const positionMillis = useSelector((state: RootState) => state.player.positionMillis);
  const durationMillis = useSelector((state: RootState) => state.player.durationMillis);
  const likedSongs = useSelector((state: RootState) => state.library.likedSongs);
  const isGuestMode = useSelector((state: RootState) => state.auth.isGuestMode);
  const sleepTimerEndAt = useSelector((state: RootState) => state.player.sleepTimerEndAt);
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const [isSleepTimerVisible, setIsSleepTimerVisible] = React.useState(false);
  const showLyrics = useSelector((state: RootState) => state.ui.showLyrics);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const lyricsScrollRef = useRef<ScrollView>(null);

  const currentIndex = currentTrack && queue.length > 0 
    ? queue.findIndex(t => t.id === currentTrack?.id) 
    : 0;

  // scale: starts at 0.9 for a subtle entrance effect
  const scale = useSharedValue(0.9);
  const shadowOpacity = useSharedValue(0.15);
  const breathe = useSharedValue(0); // 0→1 breathing offset when playing
  const glowIntensity = useSharedValue(0); // 0→1 drives the glow behind the artwork

  useEffect(() => {
    if (isPlaying) {
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
  }, [isPlaying]);
  useEffect(() => {
    // Reset lyrics scroll when track changes
    if (showLyrics) {
      lyricsScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [currentTrack?.id, showLyrics]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value + breathe.value * 0.015 }],
    shadowOpacity: shadowOpacity.value,
  }));

  const onTrackChange = useCallback(async (newIdx: number) => {
    if (queue.length === 0 || !queue[newIdx]) return;
    const track = queue[newIdx];
    if (track && track.id !== currentTrack?.id) {
      await audioPlayer.loadPlayTrack(track);
    }
  }, [queue, currentTrack]);

  const isLiked = currentTrack 
    ? likedSongs.some(t => t.id === currentTrack?.id) 
    : false;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < queue.length - 1;

  const handleSeek = useCallback((value: number) => {
    audioPlayer.seek(value);
  }, []);

  const handleAddToPlaylist = useCallback((playlistId: string) => {
    if (currentTrack) {
      dispatch(addTrackToPlaylistAction({ 
        playlistId, 
        track: currentTrack 
      }));
      setIsPickerVisible(false);
    }
  }, [currentTrack, dispatch]);

  const onToggleLike = useCallback(() => {
    if (currentTrack) {
      dispatch(toggleLikeSongAction(currentTrack));
    }
  }, [currentTrack, dispatch]);

  const onToggleShuffle = useCallback(() => dispatch(toggleShuffle()), [dispatch]);
  const onToggleRepeat = useCallback(() => dispatch(toggleRepeat()), [dispatch]);
  const onPlayPause = useCallback(() => audioPlayer.playPause(), []);
  const onPrevious = useCallback(() => audioPlayer.playPrevious(), []);
  const onNext = useCallback(() => audioPlayer.playNext(), []);

  const handleSetSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      dispatch(setSleepTimer(null));
      dispatch(showBanner({ message: "Sleep timer disabled", type: "success" }));
    } else {
      const ms = minutes * 60 * 1000;
      dispatch(setSleepTimer(Date.now() + ms));
      dispatch(showBanner({ message: `Sleep timer set for ${minutes} minutes`, type: "success" }));
    }
  }, [dispatch]);

  if (!currentTrack) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Blurred Background */}
      <View style={StyleSheet.absoluteFill}>
        {currentTrack.image ? (
          <Image 
            source={{ uri: currentTrack.image }} 
            style={StyleSheet.absoluteFill}
            blurRadius={Platform.OS === 'ios' ? 60 : 20} 
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
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsSleepTimerVisible(true)}
          >
            <Ionicons 
              name={sleepTimerEndAt ? "timer" : "timer-outline"} 
              size={24} 
              color={sleepTimerEndAt ? accentColor : textColor} 
            />
          </TouchableOpacity> 
        </View>

        {/* 1. Album Art Carousel OR Lyrics */}
        {!showLyrics ? (
          <AlbumArtCarousel 
            queue={queue}
            currentTrack={currentTrack}
            currentIndex={currentIndex}
            onTrackChange={onTrackChange}
            animatedImageStyle={animatedImageStyle}
            glowIntensity={glowIntensity}
          />
        ) : (
          <View style={styles.lyricsContainer}>
            <ScrollView 
              ref={lyricsScrollRef}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.lyricsText, { color: textColor }]}>
                {currentTrack.name} by {currentTrack.artist}{"\n\n"}
                Lyrics coming soon!{"\n\n"}
                We are working on bringing real-time synchronized lyrics to GiG Player.{"\n\n"}
                Stay tuned for the next update.
              </Text>
            </ScrollView>
          </View>
        )}

        {/* 2. Track Info: Title + Artist (single source of truth) */}
        <View style={styles.trackInfoArea}>
          <View style={styles.trackInfoRow}>
            <DownloadButton track={currentTrack} size={24} color={textColor} />
            <View style={styles.trackInfoCenter}>
              <Text style={[styles.trackTitle, { color: textColor }]} numberOfLines={1}>
                {currentTrack.name}
              </Text>
              <Text style={[styles.trackArtist, { color: `${textColor}99` }]} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
            <View style={styles.trackInfoActions}>
              {!isGuestMode && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsPickerVisible(true);
                    }}
                    style={{ marginRight: 16 }}
                  >
                    <Ionicons name="add-circle-outline" size={26} color={textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      onToggleLike();
                    }}
                  >
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={24}
                      color={isLiked ? accentColor : textColor}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* 3. Progress Bar */}
        <ProgressBar 
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          onSeek={handleSeek}
          textColor={textColor}
        />

        <PlaybackControls 
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          onToggleShuffle={onToggleShuffle}
          onToggleRepeat={onToggleRepeat}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          onOpenQueue={() => navigation.navigate("Queue")}
          onToggleLyrics={() => dispatch(setShowLyrics(!showLyrics))}
          showLyrics={showLyrics}
          artist={currentTrack.artist}
          textColor={textColor}
        />

        {/* 5. Bottom Fixed Actions (End of Screen) */}
        <View style={styles.bottomFixedActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch(setShowLyrics(!showLyrics));
            }}
            style={styles.bottomEdgeBtn}
          >
            <Ionicons 
              name="text-outline" 
              size={26} 
              color={showLyrics ? accentColor : textColor} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch(showBanner({ message: "Share feature coming soon!", type: "warning" }));
            }}
            style={styles.bottomEdgeBtn}
          >
            <Ionicons name="share-social-outline" size={26} color={textColor} />
          </TouchableOpacity>
        </View>

        <PlaylistPicker 
          isVisible={isPickerVisible} 
          onClose={() => setIsPickerVisible(false)}
          onSelect={handleAddToPlaylist}
        />

        <SleepTimerModal
          visible={isSleepTimerVisible}
          onClose={() => setIsSleepTimerVisible(false)}
          currentEndAt={sleepTimerEndAt}
          onSelectTime={handleSetSleepTimer}
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
  },
  lyricsContainer: {
    flex: 1,
    marginHorizontal: 30,
    marginVertical: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
    padding: 24,
  },
  lyricsText: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '600',
  },
  trackInfoArea: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackInfoCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  trackInfoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomFixedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 'auto',
    marginBottom: 10,
    paddingTop: 20,
  },
  bottomEdgeBtn: {
    padding: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
