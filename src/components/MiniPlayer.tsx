import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Ionicons } from "@expo/vector-icons";
import { audioPlayer } from "../services/audio/AudioPlayerService";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, positionMillis, durationMillis } = useSelector(
    (state: RootState) => state.player
  );
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");

  if (!currentTrack) {
    return null;
  }

  const progressPercent = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;
  
  // Floating Pill Design
  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 10 }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.container, 
          { 
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          }
        ]}
        onPress={() => navigation.navigate("NowPlaying")}
      >
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.content}>
          <Image source={{ uri: currentTrack.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {currentTrack.name}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => audioPlayer.playPause()} style={styles.playBtn}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => audioPlayer.playNext()} style={styles.nextBtn}>
              <Ionicons name="play-skip-forward" size={22} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 100,
    // Add shadow to the wrapper for better elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  container: {
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#B34A30",
    shadowColor: "#B34A30",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  artist: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});



