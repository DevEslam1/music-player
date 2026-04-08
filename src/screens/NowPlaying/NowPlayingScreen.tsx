import React, { useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store/store";
import { toggleLikeSong } from "../../redux/store/library/librarySlice";
import { toggleShuffle, toggleRepeat } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import Slider from "@react-native-community/slider";
import PagerView from "react-native-pager-view";
import { Image } from "react-native";

const { width } = Dimensions.get("window");

export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const likedSongs = useSelector((state: RootState) => state.library.likedSongs);
  
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const isLiked = player.currentTrack 
    ? likedSongs.some(t => t.id === player.currentTrack?.id) 
    : false;

  const pagerRef = useRef<PagerView>(null);

  // Sync pager view with current track
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

  if (!player.currentTrack) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Playing Now</Text>
        <View style={styles.headerButton} /> 
      </View>

      {/* Album Art Carousel */}
      <View style={styles.carouselContainer}>
        {player.queue.length > 0 ? (
          <PagerView 
            ref={pagerRef} 
            style={styles.pagerView} 
            initialPage={0}
            onPageSelected={onPageSelected}
          >
            {player.queue.map((track, index) => (
              <View key={`${track.id}-${index}`} style={styles.page}>
                <Image source={{ uri: track.image || "https://picsum.photos/400" }} style={styles.albumArt} />
              </View>
            ))}
          </PagerView>
        ) : (
          <View style={styles.page}>
            <Image source={{ uri: player.currentTrack.image || "https://picsum.photos/400" }} style={styles.albumArt} />
          </View>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.infoRow}>
        <View style={styles.textStack}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{player.currentTrack.name}</Text>
          <Text style={styles.artist} numberOfLines={1}>{player.currentTrack.artist}</Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(toggleLikeSong(player.currentTrack!))}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#B34A30" : textColor} />
        </TouchableOpacity>
      </View>

      {/* Secondary Controls Row */}
      <View style={styles.secondaryControls}>
        <Ionicons name="volume-medium-outline" size={24} color={textColor} />
        <View style={styles.rightSecondaryControls}>
          <TouchableOpacity onPress={() => dispatch(toggleRepeat())} style={styles.secondaryBtn}>
            <Ionicons name="repeat-outline" size={20} color={player.repeatMode !== 'off' ? "#B34A30" : textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dispatch(toggleShuffle())} style={styles.secondaryBtn}>
            <Ionicons name="shuffle-outline" size={20} color={player.isShuffled ? "#B34A30" : textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
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
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#B34A30"
          maximumTrackTintColor="#CBD5E1"
          thumbTintColor="#0F172A"
        />
      </View>

      {/* Main Controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity onPress={() => audioPlayer.playPrevious()} style={styles.controlBtn}>
          <Ionicons name="play-skip-back-outline" size={32} color={textColor} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => audioPlayer.playPause()} style={styles.playPauseBtn}>
          <Ionicons name={player.isPlaying ? "pause-outline" : "play-outline"} size={40} color={textColor} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => audioPlayer.playNext()} style={styles.controlBtn}>
          <Ionicons name="play-skip-forward-outline" size={32} color={textColor} />
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10, // give some space before image
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
  albumArt: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  textStack: {
    flex: 1,
    paddingRight: 16,
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
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 32,
  },
});

