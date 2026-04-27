import { Image } from "expo-image";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { Ionicons } from "@expo/vector-icons";
import { audioPlayer } from "../services/audio/AudioPlayerService";
import { useNavigation } from "@react-navigation/native";
import { useAccentColor, useThemeColor } from "../hooks/use-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';

const MiniPlayerInner = () => {
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const { positionMillis, durationMillis } = useSelector(
    (state: RootState) => ({
      positionMillis: state.player.positionMillis,
      durationMillis: state.player.durationMillis,
    }),
    shallowEqual,
  );
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  if (!currentTrack) {
    return null;
  }

  const progressPercent = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;
  
  
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
        <View style={[styles.progressBarBackground, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
                shadowColor: accentColor,
                shadowOpacity: 0.8,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },
              }
            ]} 
          />
        </View>
        <View style={styles.content}>
          <Image
            source={{ uri: currentTrack.image }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.info}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {currentTrack.name}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              audioPlayer.playPause();
            }} style={styles.playBtn}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              audioPlayer.playNext();
            }} style={styles.nextBtn}>
              <Ionicons name="play-skip-forward" size={22} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const MiniPlayer = React.memo(MiniPlayerInner);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 100,
    
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


