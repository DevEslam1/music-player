import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PagerView from "react-native-pager-view";

import { RootState, AppDispatch } from "../../redux/store/store";
import { scanLocalLibrary, setSortOrder, selectSortedTracks } from "../../redux/store/localLibrary/localLibrarySlice";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../../services/audio/AudioPlayerService";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { LocalTrack, LocalArtist, LocalAlbum, LocalFolder } from "../../types";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SearchBar } from "../../components/library/SearchBar";
import { MainStack } from "../../navigation/AppNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABS = ["Songs", "Artists", "Albums", "Folders"] as const;

// ─── Permission Gate ──────────────────────────────────────────────────────────
function PermissionGate({ onGrant }: { onGrant: () => void }) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const bg = useThemeColor({}, "background");
  return (
    <View style={[styles.centerContainer, { backgroundColor: bg }]}>
      <Ionicons name="musical-notes" size={80} color={accentColor} />
      <Text style={[styles.bigTitle, { color: textColor }]}>Access Your Music</Text>
      <Text style={[styles.subtitle, { color: textColor + "80" }]}>
        GiG Player needs permission to read your device music files to browse and play local songs.
      </Text>
      <TouchableOpacity style={[styles.pill, { backgroundColor: accentColor }]} onPress={onGrant}>
        <Text style={styles.pillText}>Grant Access</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Scan Progress ────────────────────────────────────────────────────────────
function ScanProgress({ scanned, total }: { scanned: number; total: number }) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const bg = useThemeColor({}, "background");
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: total > 0 ? scanned / total : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [scanned, total]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={[styles.centerContainer, { backgroundColor: bg }]}>
      <Ionicons name="library-outline" size={60} color={accentColor} />
      <Text style={[styles.bigTitle, { color: textColor }]}>Scanning Library…</Text>
      <Text style={[styles.subtitle, { color: textColor + "80" }]}>
        {scanned > 0 ? `${scanned}${total > 0 ? ` / ${total}` : ""} songs found` : "Searching for music files…"}
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: accentColor + "30" }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: accentColor, width }]} />
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyLibrary({ onRescan }: { onRescan: () => void }) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const bg = useThemeColor({}, "background");
  return (
    <View style={[styles.centerContainer, { backgroundColor: bg }]}>
      <Ionicons name="folder-open-outline" size={80} color={accentColor + "60"} />
      <Text style={[styles.bigTitle, { color: textColor }]}>No Music Found</Text>
      <Text style={[styles.subtitle, { color: textColor + "80" }]}>
        No audio files were found on your device. Make sure music files are stored in your Downloads or Music folder.
      </Text>
      <TouchableOpacity style={[styles.pill, { backgroundColor: accentColor }]} onPress={onRescan}>
        <Text style={styles.pillText}>Scan Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Songs Tab ────────────────────────────────────────────────────────────────
function SongsTab({ 
  tracks, 
  query, 
  selectionMode, 
  selectedIds, 
  toggleSelection 
}: { 
  tracks: LocalTrack[]; 
  query: string;
  selectionMode: boolean;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
}) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();

  const filtered = query
    ? tracks.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()))
    : tracks;

  const handlePlay = useCallback(async (track: LocalTrack) => {
    if (selectionMode) {
      toggleSelection(track.id);
      return;
    }
    dispatch(setQueue(filtered as any[]));
    await audioPlayer.loadPlayTrack(track as any);
    navigation.navigate("NowPlaying");
  }, [filtered, dispatch, navigation, selectionMode, toggleSelection]);

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const TypedFlashList = FlashList as any;

  return (
    <View style={styles.tabContainer}>
      <TypedFlashList
        data={filtered}
        keyExtractor={(item: LocalTrack) => item.id}
        estimatedItemSize={68}
        renderItem={({ item, index }: { item: LocalTrack; index: number }) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <TouchableOpacity 
              style={[styles.songRow, isSelected && { backgroundColor: accentColor + "15" }]} 
              onPress={() => handlePlay(item)} 
              onLongPress={() => toggleSelection(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.songIdx, { backgroundColor: isSelected ? accentColor : accentColor + "12" }]}>
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  ) : (
                    <Ionicons name="musical-notes" size={16} color={accentColor} />
                  )}
                </View>
                {!isSelected && !!item.image && item.image.length > 10 && (
                  <Image source={{ uri: item.image }} style={styles.songImg} contentFit="cover" transition={200} />
                )}
              </View>
              <View style={styles.songInfo}>
                <Text style={[styles.songName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.songArtist, { color: textColor + "50" }]} numberOfLines={1}>{item.artist}</Text>
              </View>
              {!selectionMode && (
                <View style={styles.songRight}>
                  <Text style={[styles.songDur, { color: textColor + "40" }]}>{fmt(item.duration)}</Text>
                  <Ionicons name="play-circle" size={24} color={accentColor} style={{ opacity: 0.9 }} />
                </View>
              )}
              <View style={[styles.rowSeparator, { backgroundColor: textColor + "08" }]} />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Artists Tab ──────────────────────────────────────────────────────────────
function ArtistsTab({ artists }: { artists: LocalArtist[] }) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const TypedFlashList = FlashList as any;
  return (
    <View style={styles.tabContainer}>
      <TypedFlashList
        data={artists}
        keyExtractor={(item: LocalArtist) => item.name}
        estimatedItemSize={78}
        renderItem={({ item }: { item: LocalArtist }) => (
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate("LocalArtistDetail", { artistName: item.name })}
            activeOpacity={0.7}
          >
            <View style={[styles.circleThumb, { backgroundColor: accentColor + "15" }]}>
              <Ionicons name="person" size={22} color={accentColor} />
              {!!item.coverImage && item.coverImage.length > 10 && (
                <Image source={{ uri: item.coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              )}
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.rowMeta, { color: textColor + "50" }]}>
                {item.trackCount} song{item.trackCount !== 1 ? "s" : ""}
                {item.albumCount > 0 ? ` · ${item.albumCount} album${item.albumCount !== 1 ? "s" : ""}` : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={textColor + "30"} />
            <View style={[styles.rowSeparator, { backgroundColor: textColor + "08", left: 78 }]} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Albums Tab ───────────────────────────────────────────────────────────────
function AlbumsTab({ albums }: { albums: LocalAlbum[] }) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const TypedFlashList = FlashList as any;
  const CARD = (SCREEN_WIDTH - 48) / 2;
  return (
    <View style={styles.tabContainer}>
      <TypedFlashList
        data={albums}
        keyExtractor={(item: LocalAlbum) => item.id}
        numColumns={2}
        estimatedItemSize={CARD + 50}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }: { item: LocalAlbum; index: number }) => (
          <View style={{ width: "50%", paddingRight: index % 2 === 0 ? 8 : 0, paddingLeft: index % 2 === 1 ? 8 : 0, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("LocalAlbumDetail", { albumName: item.name })}
              activeOpacity={0.8}
            >
              <View style={[styles.albumArt, { width: CARD, height: CARD, backgroundColor: accentColor + "20" }]}>
                <Ionicons name="disc-outline" size={40} color={accentColor + "60"} />
                {!!item.coverImage && item.coverImage.length > 10 && (
                  <Image source={{ uri: item.coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                )}
              </View>
              <Text style={[styles.albumTitle, { color: textColor }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.albumArtistTxt, { color: textColor + "60" }]} numberOfLines={1}>{item.artist}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// ─── Folders Tab ──────────────────────────────────────────────────────────────
function FoldersTab({ folders }: { folders: LocalFolder[] }) {
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const TypedFlashList = FlashList as any;
  return (
    <View style={styles.tabContainer}>
      <TypedFlashList
        data={folders}
        keyExtractor={(item: LocalFolder) => item.path}
        estimatedItemSize={78}
        renderItem={({ item }: { item: LocalFolder }) => (
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate("LocalFolderDetail", { folderPath: item.path, folderName: item.name })}
            activeOpacity={0.7}
          >
            <View style={[styles.folderThumb, { backgroundColor: accentColor + "12" }]}>
              <Ionicons name="folder" size={26} color={accentColor} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.rowMeta, { color: textColor + "50" }]}>
                {item.trackCount} song{item.trackCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={textColor + "30"} />
            <View style={[styles.rowSeparator, { backgroundColor: textColor + "08", left: 78 }]} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LocalLibraryScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { artists, albums, folders, scanStatus, scanProgress, permissionStatus, sortOrder } =
    useSelector((state: RootState) => state.localLibrary);
  const tracks = useSelector(selectSortedTracks);

  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();
  const bg = useThemeColor({}, "background");

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  const pagerRef = useRef<PagerView>(null);
  const tabAnim = useRef(new Animated.Value(0)).current;

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchPlay = () => {
    const toPlay = tracks.filter(t => selectedIds.has(t.id));
    if (toPlay.length > 0) {
      dispatch(setQueue(toPlay as any[]));
      audioPlayer.loadPlayTrack(toPlay[0] as any);
      navigation.navigate("NowPlaying");
      clearSelection();
    }
  };

  useEffect(() => {
    if (scanStatus === "idle") dispatch(scanLocalLibrary(undefined));
  }, []);

  const goTab = (i: number) => {
    setActiveTab(i);
    pagerRef.current?.setPage(i);
    Animated.spring(tabAnim, { toValue: i, useNativeDriver: true, tension: 80, friction: 12 }).start();
  };

  const handleRescan = () => dispatch(scanLocalLibrary({ forceRescan: true }));

  if (permissionStatus === "denied" || (permissionStatus === "undetermined" && scanStatus === "idle")) {
    return <PermissionGate onGrant={() => dispatch(scanLocalLibrary(undefined))} />;
  }
  if (scanStatus === "scanning") {
    return <ScanProgress scanned={scanProgress.scanned} total={scanProgress.total} />;
  }
  if (scanStatus === "done" && tracks.length === 0) return <EmptyLibrary onRescan={handleRescan} />;
  if (scanStatus === "error") return <EmptyLibrary onRescan={handleRescan} />;

  const tabW = (SCREEN_WIDTH - 32) / TABS.length;
  const indicatorX = tabAnim.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * tabW),
  });

  const cycleSort = () => {
    const orders: ("name" | "date" | "duration")[] = ["name", "date", "duration"];
    const next = orders[(orders.indexOf(sortOrder) + 1) % orders.length];
    dispatch(setSortOrder(next));
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <View style={{ flex: 1, paddingTop: insets.top + 80 }}>
        {/* Row (Tabs) First */}
        <View style={[styles.tabBar, { backgroundColor: textColor + "08", marginBottom: 16 }]}>
          <Animated.View style={[styles.tabIndicator, { width: tabW, backgroundColor: accentColor, transform: [{ translateX: indicatorX }] }]} />
          {TABS.map((label, i) => (
            <TouchableOpacity key={label} style={[styles.tabBtn, { width: tabW }]} onPress={() => goTab(i)}>
              <Text style={[styles.tabLabel, { color: activeTab === i ? accentColor : textColor + "60", fontWeight: activeTab === i ? "700" : "500" }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Then Search Bar */}
        <SearchBar
          query={searchQuery}
          onChangeText={setSearchQuery}
          onSearchPress={() => setSearchQuery("")}
          autoFocus={false}
        />

        {/* Then Songs */}
        <View style={{ flex: 1 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={e => {
              const p = e.nativeEvent.position;
              setActiveTab(p);
              Animated.spring(tabAnim, { toValue: p, useNativeDriver: true, tension: 80, friction: 12 }).start();
            }}
          >
            <View key="songs">
              <SongsTab 
                tracks={tracks} 
                query={searchQuery} 
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                toggleSelection={toggleSelection}
              />
            </View>
            <View key="artists"><ArtistsTab artists={artists} /></View>
            <View key="albums"><AlbumsTab albums={albums} /></View>
            <View key="folders"><FoldersTab folders={folders} /></View>
          </PagerView>
        </View>
      </View>

      <ScreenHeader
        screenTitle={selectionMode ? `${selectedIds.size} selected` : "Local Music"}
        leftIcon={selectionMode ? "close" : "menu-outline"}
        onBack={selectionMode ? clearSelection : () => navigation.openDrawer()}
        rightComponent={
          selectionMode ? (
            <TouchableOpacity onPress={handleBatchPlay}>
              <Ionicons name="play" size={24} color={accentColor} />
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={cycleSort}>
                <Ionicons 
                  name={sortOrder === 'name' ? 'text' : sortOrder === 'duration' ? 'time-outline' : 'calendar-outline'} 
                  size={22} 
                  color={textColor} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRescan}>
                <Ionicons name="refresh-outline" size={22} color={textColor} />
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 16 },
  bigTitle: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 16 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  pill: { marginTop: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30 },
  pillText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  progressTrack: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden", marginTop: 8 },
  progressFill: { height: "100%", borderRadius: 3 },
  tabBar: {
    height: 44, marginHorizontal: 16,
    borderRadius: 12, flexDirection: "row", overflow: "hidden", zIndex: 10,
  },
  tabIndicator: { position: "absolute", height: 44, borderRadius: 12, opacity: 0.18 },
  tabBtn: { height: 44, alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 13, letterSpacing: 0.2 },
  tabContainer: { flex: 1 },
  // Song row
  songRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, gap: 12, height: 68 },
  songIdx: { width: 56, height: 56, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  songImg: { width: "100%", height: "100%" },
  songIdxTxt: { fontSize: 13, fontWeight: "800" },
  songInfo: { flex: 1 },
  songName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  songArtist: { fontSize: 12 },
  songRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  songDur: { fontSize: 12 },
  // Generic row
  rowItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 14 },
  circleThumb: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  folderThumb: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
  rowMeta: { fontSize: 13 },
  rowSeparator: { position: "absolute", bottom: 0, left: 68, right: 0, height: 1 },
  // Album grid
  albumArt: { borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  albumTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  albumArtistTxt: { fontSize: 12 },
});
