import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootState, AppDispatch } from "../../redux/store/store";
import {
  selectTracksByAlbum,
  updateEnrichedTracks,
} from "../../redux/store/localLibrary/localLibrarySlice";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { LocalMusicService } from "../../services/local/localMusicService";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { LocalTrack } from "../../types";
import { ScreenHeader } from "../../components/ScreenHeader";
import { MainStack } from "../../navigation/AppNavigator";

export default function LocalAlbumDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<MainStack, "LocalAlbumDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const dispatch = useDispatch<AppDispatch>();

  const { albumName } = route.params;
  const albumId = albumName.toLowerCase().replace(/\s+/g, "-");

  const allTracks = useSelector((state: RootState) => state.localLibrary.tracks);
  const enrichedAlbumIds = useSelector((state: RootState) => state.localLibrary.enrichedAlbumIds);
  const tracks = selectTracksByAlbum(allTracks, albumName);
  const coverImage = tracks.find(t => t.image)?.image ?? "";
  const artist = tracks[0]?.artist ?? "Unknown Artist";

  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const bg = useThemeColor({}, "background");

  // Lazy metadata enrichment for this album on first view
  useEffect(() => {
    if (!enrichedAlbumIds.includes(albumId) && tracks.length > 0) {
      LocalMusicService.enrichMetadata(tracks).then(enriched => {
        dispatch(updateEnrichedTracks({ albumId, tracks: enriched }));
      }).catch(() => {/* Silently ignore enrichment failures */});
    }
  }, [albumId]);

  const handlePlay = useCallback(async (track: LocalTrack, queue: LocalTrack[]) => {
    dispatch(setQueue(queue as any[]));
    await audioPlayer.loadPlayTrack(track as any);
    navigation.navigate("NowPlaying");
  }, [dispatch, navigation]);

  const handlePlayAll = () => { if (tracks.length > 0) handlePlay(tracks[0], tracks); };
  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const s = [...tracks].sort(() => Math.random() - 0.5);
    handlePlay(s[0], s);
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMin = Math.round(totalDuration / 60000);

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <ScreenHeader screenTitle={albumName} onBack={() => navigation.goBack()} />

      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 90 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.hero}>
            <View style={[styles.albumCover, { backgroundColor: accentColor + "20" }]}>
              {coverImage
                ? <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
                : <Ionicons name="disc-outline" size={60} color={accentColor + "60"} />}
            </View>
            <Text style={[styles.albumTitle, { color: textColor }]}>{albumName}</Text>
            <Text style={[styles.albumArtist, { color: accentColor }]}>{artist}</Text>
            <Text style={[styles.albumMeta, { color: textColor + "50" }]}>
              {tracks.length} song{tracks.length !== 1 ? "s" : ""} · {totalMin} min
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: accentColor }]} onPress={handlePlayAll}>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.actionBtnTxt}>Play All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: accentColor }]} onPress={handleShuffle}>
                <Ionicons name="shuffle" size={18} color={accentColor} />
                <Text style={[styles.actionBtnTxt, { color: accentColor }]}>Shuffle</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.row} onPress={() => handlePlay(item, tracks)} activeOpacity={0.7}>
            <Text style={[styles.idx, { color: textColor + "50" }]}>{index + 1}</Text>
            <View style={styles.info}>
              <Text style={[styles.trackTitle, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
            </View>
            <Text style={[styles.dur, { color: textColor + "50" }]}>{fmt(item.duration)}</Text>
            <Ionicons name="play-circle-outline" size={24} color={accentColor} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  hero: { alignItems: "center", paddingVertical: 24, marginBottom: 16 },
  albumCover: {
    width: 180, height: 180, borderRadius: 20,
    alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  albumTitle: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 4 },
  albumArtist: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  albumMeta: { fontSize: 13, marginBottom: 20 },
  actions: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30,
  },
  actionBtnOutline: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, borderWidth: 1.5,
  },
  actionBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 12 },
  idx: { width: 28, fontSize: 14, fontWeight: "600", textAlign: "center" },
  info: { flex: 1 },
  trackTitle: { fontSize: 15, fontWeight: "600" },
  dur: { fontSize: 12, marginRight: 4 },
});
