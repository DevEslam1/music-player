import React, { useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Platform
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
import Slider from "@react-native-community/slider";
import PagerView from "react-native-pager-view";
import { Image } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
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
  carouselContainer: {
    height: width * 0.85,
    marginBottom: 20,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtShadow: {
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 20,
    backgroundColor: '#000', 
    borderRadius: 24,
  },
  albumArt: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
    position: 'relative',
  },
  textStack: {
    alignItems: 'center',
    paddingHorizontal: 54, 
  },
  actionsBox: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: 'center',
  },
  artist: {
    fontSize: 14,
    color: "#A0AEC0",
    textAlign: 'center',
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  rightSecondaryControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryBtn: {
    marginLeft: 24,
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 8,
    color: '#B34A30',
    fontWeight: 'bold',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  controlBtn: {
    padding: 16,
  },
  playPauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B34A30',
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 32,
    shadowColor: "#B34A30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const player = useSelector((state: RootState) => state.player);
  const likedSongs = useSelector((state: RootState) => state.library.likedSongs);
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const isLiked = player.currentTrack 
    ? likedSongs.some(t => t.id === player.currentTrack?.id) 
    : false;

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

  const onPageSelected = async (e: any) => {
    const newIdx = e.nativeEvent.position;
    
    
    if (player.queue.length === 0 || !player.queue[newIdx]) return;
    
    const track = player.queue[newIdx];
    
    
    
    if (track && track.id !== player.currentTrack?.id) {
      await audioPlayer.loadPlayTrack(track);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (value: number) => {
    audioPlayer.seek(value);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (player.currentTrack) {
      dispatch(addTrackToPlaylistAction({ 
        playlistId, 
        trackId: player.currentTrack.id 
      }));
      setIsPickerVisible(false);
    }
  };

  if (!player.currentTrack) return null;

  return (
    <View style={styles.container}>
      {}
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
        {}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={26} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Playing Now</Text>
          <View style={styles.headerButton} /> 
        </View>

      {}
      <View style={styles.carouselContainer}>
        {player.queue.length > 0 ? (
          <PagerView 
            ref={pagerRef} 
            style={styles.pagerView} 
            initialPage={initialPageIndex}
            onPageSelected={onPageSelected}
          >
            {player.queue.map((track, index) => (
              <View key={`${track.id}-${index}`} style={styles.page}>
                <View style={styles.albumArtShadow}>
                  <Animated.Image 
                    source={{ uri: track.image || "https://picsum.photos/400" }} 
                    style={[styles.albumArt, animatedImageStyle]} 
                  />
                </View>
              </View>
            ))}
          </PagerView>
        ) : (
          <View style={styles.page}>
            <View style={styles.albumArtShadow}>
              <Animated.Image 
                source={{ uri: player.currentTrack.image || "https://picsum.photos/400" }} 
                style={[styles.albumArt, animatedImageStyle]} 
              />
            </View>
          </View>
        )}
      </View>

      {}
      <View style={styles.infoRow}>
        <View style={styles.textStack}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{player.currentTrack.name}</Text>
          <Text style={styles.artist} numberOfLines={1}>{player.currentTrack.artist}</Text>
        </View>
        <View style={styles.actionsBox}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPickerVisible(true);
            }} 
            style={styles.actionBtn}
          >
             <Ionicons name="add-circle-outline" size={28} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              dispatch(toggleLikeSongAction(player.currentTrack!));
            }}
          >
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#B34A30" : textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={styles.secondaryControls}>
        <Ionicons name="volume-medium-outline" size={24} color={textColor} />
        <View style={styles.rightSecondaryControls}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch(toggleRepeat());
            }} 
            style={styles.secondaryBtn}
          >
            <Ionicons 
              name={player.repeatMode === 'track' ? "repeat" : "repeat-outline"} 
              size={20} 
              color={player.repeatMode !== 'off' ? "#B34A30" : textColor} 
            />
            {player.repeatMode !== 'off' && (
              <Text style={styles.modeLabel}>
                {player.repeatMode === 'track' ? '1' : 'All'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch(toggleShuffle());
            }} 
            style={styles.secondaryBtn}
          >
            <Ionicons name="shuffle-outline" size={20} color={player.isShuffled ? "#B34A30" : textColor} />
            {player.isShuffled && (
              <Text style={styles.modeLabel}>On</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={styles.progressContainer}>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: textColor }]}>{formatTime(player.positionMillis)}</Text>
          <Text style={[styles.timeText, { color: textColor }]}>{formatTime(player.durationMillis)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={player.durationMillis || 30000}
          value={player.positionMillis}
          onSlidingComplete={(val) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSeek(val);
          }}
          minimumTrackTintColor="#B34A30"
          maximumTrackTintColor="#CBD5E1"
          thumbTintColor="#B34A30"
        />
      </View>

      {}
      <View style={styles.mainControls}>
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            audioPlayer.playPrevious();
          }} 
          style={styles.controlBtn}
        >
          <Ionicons name="play-skip-back-outline" size={32} color={textColor} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            audioPlayer.playPause();
          }} 
          style={styles.playPauseBtn}
        >
          <Ionicons name={player.isPlaying ? "pause" : "play"} size={44} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            audioPlayer.playNext();
          }} 
          style={styles.controlBtn}
        >
          <Ionicons name="play-skip-forward-outline" size={32} color={textColor} />
        </TouchableOpacity>
      </View>

      <PlaylistPicker 
        isVisible={isPickerVisible} 
        onClose={() => setIsPickerVisible(false)}
        onSelect={handleAddToPlaylist}
      />
      
    </SafeAreaView>
  </View>
  );
}

