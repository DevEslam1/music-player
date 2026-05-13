import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootState, AppDispatch } from "../../redux/store/store";
import { selectTracksByArtist } from "../../redux/store/localLibrary/localLibrarySlice";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { LocalTrack } from "../../types";
import { ScreenHeader } from "../../components/ScreenHeader";
import { MainStack } from "../../navigation/AppNavigator";

export default function LocalArtistDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<MainStack, "LocalArtistDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const dispatch = useDispatch<AppDispatch>();

  const { artistName } = route.params;

  const allTracks = useSelector((state: RootState) => state.localLibrary.tracks);
  const tracks = selectTracksByArtist(allTracks, artistName);
  const coverImage = tracks.find(t => t.image)?.image ?? "";

  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const bg = useThemeColor({}, "background");

  const handlePlay = useCallback(async (track: LocalTrack, queue: LocalTrack[]) => {
    dispatch(setQueue(queue as any[]));
    await audioPlayer.loadPlayTrack(track as any);
    navigation.navigate("NowPlaying");
  }, [dispatch, navigation]);

  const handlePlayAll = () => {
    if (tracks.length > 0) handlePlay(tracks[0], tracks);
  };

  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    handlePlay(shuffled[0], shuffled);
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <ScreenHeader screenTitle={artistName} onBack={() => navigation.goBack()} />

      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 90 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.hero}>
            <View style={[styles.heroAvatar, { backgroundColor: accentColor + "20" }]}>
              {coverImage
                ? <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
                : <Ionicons name="person" size={56} color={accentColor} />}
            </View>
            <Text style={[styles.heroName, { color: textColor }]}>{artistName}</Text>
            <Text style={[styles.heroMeta, { color: textColor + "60" }]}>
              {tracks.length} song{tracks.length !== 1 ? "s" : ""}
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
            <View style={[styles.imgContainer, { backgroundColor: accentColor + "12" }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <Ionicons name="musical-notes" size={14} color={accentColor} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.meta, { color: textColor + "50" }]} numberOfLines={1}>{item.album}</Text>
            </View>
            <View style={styles.rightSide}>
              <Text style={[styles.dur, { color: textColor + "40" }]}>{fmt(item.duration)}</Text>
              <Ionicons name="play-circle" size={22} color={accentColor} style={{ opacity: 0.9 }} />
            </View>
            <View style={[styles.rowSeparator, { backgroundColor: textColor + "08" }]} />
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
  heroAvatar: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 16,
  },
  heroName: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 4 },
  heroMeta: { fontSize: 14, marginBottom: 20 },
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
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  imgContainer: { width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  idx: { width: 28, fontSize: 13, fontWeight: "800", textAlign: "center" },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  meta: { fontSize: 12 },
  rightSide: { flexDirection: "row", alignItems: "center", gap: 10 },
  dur: { fontSize: 12 },
  rowSeparator: { position: "absolute", bottom: 0, left: 56, right: 0, height: 1 },
});
