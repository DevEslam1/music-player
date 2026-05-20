import { Image } from "expo-image";
import React, { useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Share, BackHandler, useWindowDimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Sharing from 'expo-sharing';
import { useThemeColor, useColorScheme, useAccentColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import { toggleLikeSongAction, addTrackToPlaylistAction } from "../../redux/store/library/librarySlice";
import { toggleShuffle, toggleRepeat, setSleepTimer } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { DownloadService } from "../../services/api/downloadService";
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
import { LyricsService, LyricsLine } from "../../services/api/lyricsService";
import { EqualizerModal } from "../../components/player/EqualizerModal";



export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const { height } = useWindowDimensions();
  const isShortScreen = height < 750;

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Drawer');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation])
  );

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
  const [lyrics, setLyrics] = React.useState<LyricsLine[]>([]);
  const [isLyricsLoading, setIsLyricsLoading] = React.useState(false);
  const [isEqualizerVisible, setIsEqualizerVisible] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const lyricsScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLyrics = async () => {
      if (!currentTrack) return;
      setIsLyricsLoading(true);
      try {
        const result = await LyricsService.getLyrics(currentTrack);
        if (isMounted) {
          setLyrics(result);
        }
      } catch (e) {
        if (isMounted) {
          setLyrics([]);
        }
      } finally {
        if (isMounted) {
          setIsLyricsLoading(false);
        }
      }
    };

    fetchLyrics();
    return () => { isMounted = false; };
  }, [currentTrack?.id]);

  // Find the active line based on current playback position
  const activeLineIndex = React.useMemo(() => {
    if (!lyrics.length) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (positionMillis >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lyrics, positionMillis]);

  // Auto-scroll to active line
  useEffect(() => {
    if (showLyrics && activeLineIndex !== -1 && lyricsScrollRef.current) {
      // Calculate scroll position to center the active line (approx 60px per line)
      const scrollY = Math.max(0, activeLineIndex * 64 - 140); 
      lyricsScrollRef.current.scrollTo({ y: scrollY, animated: true });
    }
  }, [activeLineIndex, showLyrics]);

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

  const handleShare = useCallback(async () => {
    if (!currentTrack) return;
    
    try {
      const isLocal = currentTrack.uri.startsWith('file://') || 
                      currentTrack.uri.startsWith('content://') || 
                      (!currentTrack.uri.startsWith('http://') && !currentTrack.uri.startsWith('https://'));
      
      if (isLocal) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(currentTrack.uri, {
            dialogTitle: `Share ${currentTrack.name}`,
            mimeType: 'audio/mpeg', 
          });
          return;
        } else {
          throw new Error("Sharing is not available on this device.");
        }
      } else {
        const shareUrl = currentTrack.previewUrl || currentTrack.uri;
        const message = `Check out "${currentTrack.name}" by ${currentTrack.artist} on GiG Player!\n\nListen here: ${shareUrl}`;
        
        await Share.share({
          message,
          title: `Share ${currentTrack.name}`,
          url: shareUrl, // iOS only
        });
      }
    } catch (error: any) {
      dispatch(showBanner({ message: error.message, type: "error" }));
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
          
          <View style={{ flexDirection: 'row' }}>
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

            {Platform.OS === 'android' && (
              <TouchableOpacity 
                style={[styles.headerButton, { marginLeft: 8 }]}
                onPress={() => setIsEqualizerVisible(true)}
              >
                <Ionicons 
                  name="options-outline" 
                  size={24} 
                  color={textColor} 
                />
              </TouchableOpacity> 
            )}
          </View>
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
              {isLyricsLoading ? (
                <View style={styles.lyricsLoadingArea}>
                   <Text style={[styles.lyricsText, { color: textColor, opacity: 0.5 }]}>
                     Loading synchronized lyrics... ✨
                   </Text>
                </View>
              ) : lyrics.length > 0 ? (
                <View style={{ paddingBottom: 300 }}>
                  {lyrics.map((line, index) => {
                    const isActive = index === activeLineIndex;
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => audioPlayer.seek(line.time)}
                        activeOpacity={0.7}
                      >
                        <Text 
                          style={[
                            styles.lyricsText, 
                            { 
                              color: isActive ? accentColor : textColor,
                              opacity: isActive ? 1 : 0.4,
                              transform: [{ scale: isActive ? 1.05 : 1 }],
                              marginVertical: 12,
                            }
                          ]}
                        >
                          {line.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={[styles.lyricsText, { color: textColor }]}>
                  No lyrics found for "{currentTrack?.name}" 💿
                </Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* 2. Track Info: Title + Artist (single source of truth) */}
        <View style={[styles.trackInfoArea, isShortScreen && { marginTop: 8, marginBottom: 4 }]}>
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
                      size={26}
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
          textColor={textColor}
        />

        {/* 5. Bottom Fixed Actions (End of Screen) */}
        <View style={[styles.bottomFixedActions, isShortScreen && { paddingTop: 10, marginBottom: 4 }]}>
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
              handleShare();
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
        <EqualizerModal 
          visible={isEqualizerVisible} 
          onClose={() => setIsEqualizerVisible(false)} 
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
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
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
    fontSize: 24,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '800',
  },
  lyricsLoadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
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
