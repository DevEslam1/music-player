import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { RootState, AppDispatch } from "../../redux/store/store";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { setQueue, setCurrentTrack, setIsPlaying } from "../../redux/store/player/playerSlice";
import { Track } from "../../types";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function QueueScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const queue = useSelector((state: RootState) => state.player.queue);
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const accentColor = useAccentColor();

  const handleDragEnd = ({ data }: { data: Track[] }) => {
    dispatch(setQueue(data));
  };

  const handleTrackPress = async (track: Track) => {
    if (track.id !== currentTrack?.id) {
      await audioPlayer.loadPlayTrack(track);
    } else {
      audioPlayer.playPause();
    }
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Track>) => {
      const isCurrentTrack = currentTrack?.id === item.id;
      
      return (
        <ScaleDecorator>
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={drag}
            disabled={isActive}
            onPress={() => handleTrackPress(item)}
            style={[
              styles.rowItem,
              { backgroundColor: isActive ? surfaceColor : backgroundColor },
              isActive && { elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4 }
            ]}
          >
            <View style={styles.leftContent}>
              <Image 
                source={{ uri: item.image || "https://via.placeholder.com/150" }} 
                style={styles.artwork} 
              />
              <View style={styles.textContainer}>
                <Text 
                  style={[
                    styles.title, 
                    { color: isCurrentTrack ? accentColor : textColor }
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={[styles.artist, { color: textColor + "80" }]} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
            </View>

            <View style={styles.rightContent}>
              {isCurrentTrack && isPlaying && (
                <Ionicons name="volume-high" size={20} color={accentColor} style={{ marginRight: 16 }} />
              )}
              <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
                <Ionicons name="menu" size={24} color={textColor + "50"} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScaleDecorator>
      );
    },
    [currentTrack, isPlaying, textColor, accentColor, surfaceColor, backgroundColor]
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        screenTitle="Playing Queue"
        leftIcon="arrow-back"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.listContainer}>
        {queue.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color={textColor + "50"} />
            <Text style={[styles.emptyText, { color: textColor + "80" }]}>Queue is empty</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={queue}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id.toString() + "-" + Math.random()}
            renderItem={renderItem}
            contentContainerStyle={styles.flatlistContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  flatlistContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dragHandle: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
});
