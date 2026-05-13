import { Image } from "expo-image";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAccentColor, useThemeColor } from "../../hooks/use-theme-color";
import { Track } from "../../types";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { useDispatch, useSelector } from "react-redux";
import { setQueue } from "../../redux/store/player/playerSlice";
import { AppDispatch, RootState } from "../../redux/store/store";
import { searchSongs } from "../../services/api/api";
import { ScreenHeader } from "../../components/ScreenHeader";
import { MainStack } from "../../navigation/AppNavigator";
import { TrackOptionsModal } from "../../components/TrackOptionsModal";

export default function TracksListScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<MainStack, "TracksList">>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const dispatch = useDispatch<AppDispatch>();
  const { title, query } = route.params;

  const [tracksList, setTracksList] = useState<Track[]>(route.params.tracks || []);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  const handlePlayTrack = async (track: Track) => {
    dispatch(setQueue(tracksList));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  };

  const fetchMoreTracks = async () => {
    if (!query || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const newTracks = await searchSongs(query, tracksList.length);
      if (newTracks.length === 0) {
        setHasMore(false);
      } else {
        
        const existingIds = new Set(tracksList.map(t => t.id));
        const uniqueNewTracks = newTracks.filter(t => !existingIds.has(t.id));
        setTracksList(prev => [...prev, ...uniqueNewTracks]);
      }
    } catch (e) {
      console.warn("Error fetching more tracks", e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  };

  const openTrackOptions = (track: Track) => {
    setSelectedTrack(track);
    setIsOptionsVisible(true);
  };

  const renderItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={() => handlePlayTrack(item)}
    >
      <Text style={styles.trackNumber}>{index + 1}</Text>
      <View style={[styles.trackImage, { backgroundColor: accentColor + "08", overflow: 'hidden' }]}>
        {!!item.image && item.image.length > 10 && (
          <Image
            source={{ uri: item.image }}
            style={StyleSheet.absoluteFill}
            transition={200}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.trackName, { color: textColor }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.moreBtn} onPress={() => openTrackOptions(item)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const TypedFlashList = FlashList as any;

  return (
    <View style={[styles.container, { backgroundColor }]}>


      <View style={{ flex: 1, paddingTop: insets.top + 85 }}>
        <TypedFlashList
          data={tracksList}
          keyExtractor={(item: Track) => item.id}
          estimatedItemSize={68}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMoreTracks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>

      <TrackOptionsModal 
        isVisible={isOptionsVisible} 
        onClose={() => setIsOptionsVisible(false)} 
        track={selectedTrack} 
      />
      <ScreenHeader screenTitle={title} onBack={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(148, 163, 184, 0.05)",
    borderRadius: 16,
    padding: 12,
  },
  trackNumber: {
    width: 25,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "bold",
    marginRight: 8,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: "#94A3B8",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreBtn: {
    padding: 8,
    marginLeft: 4,
  },
});
