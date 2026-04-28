import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor, useAccentColor } from "../../hooks/use-theme-color";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store/store";
import {
  fetchPlaylists,
  createPlaylistAction,
  deletePlaylistAction,
  selectPlaylistsLoading,
} from "../../redux/store/library/librarySlice";
import { PlaylistSummary } from "../../types";
import { ScreenHeader } from "../../components/ScreenHeader";
import { setAutoDownloadEnabled } from "../../redux/store/downloads/downloadsSlice";

export default function PlaylistScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { playlists, playlistsLastFetchedAt } = useSelector(
    (state: RootState) => state.library,
  );
  const loading = useSelector(selectPlaylistsLoading);
  const autoDownloadEnabled = useSelector(
    (state: RootState) => state.downloads.autoDownloadEnabled,
  );

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "surface");
  const inputBg = useThemeColor({}, "inputBackground");
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const accentColor = useAccentColor();

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (!playlistsLastFetchedAt) {
      dispatch(fetchPlaylists());
    }
  }, [dispatch, playlistsLastFetchedAt]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchPlaylists()).unwrap();
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleCreate = () => {
    if (newPlaylistName.trim() === "") return;
    dispatch(createPlaylistAction(newPlaylistName.trim()));
    setNewPlaylistName("");
    setIsCreating(false);
  };

  const renderItem = ({ item }: { item: PlaylistSummary }) => (
    <View style={[styles.card, { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
      <TouchableOpacity 
        style={styles.cardMain}
        onPress={() => navigation.navigate("PlaylistDetail", { playlistId: item.id, name: item.name })}
      >
        <View style={[styles.iconContainer, { backgroundColor: inputBg }]}>
          <Ionicons name="folder-outline" size={30} color={accentColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{(item as any).track_count ?? item.tracks?.length ?? 0} songs</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => dispatch(deletePlaylistAction(item.id))}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScreenHeader
        screenTitle="My Playlists"
        leftIcon="menu"
        onBack={() => navigation.openDrawer()}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => {
                dispatch(setAutoDownloadEnabled(true));
                // TODO: Batch download all playlist tracks if possible?
              }}
              style={{ marginRight: 15, padding: 4 }}
            >
              <Ionicons 
                name={autoDownloadEnabled ? "cloud-done" : "cloud-offline"} 
                size={26} 
                color={autoDownloadEnabled ? accentColor : "#94A3B8"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 4 }} onPress={() => setIsCreating(!isCreating)}>
              <Ionicons name={isCreating ? "close" : "add"} size={28} color={textColor} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 85 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accentColor}
          />
        }
      >
        {isCreating && (
          <View style={[styles.createForm, { backgroundColor: inputBg }]}>
            <Text style={[styles.formTitle, { color: textColor }]}>New Playlist</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: accentColor }]}
              placeholder="Give it a name..."
              placeholderTextColor="#94A3B8"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              selectionColor={accentColor}
            />
            <View style={styles.createFormActions}>
              <TouchableOpacity onPress={handleCreate} style={[styles.btnPrimary, { backgroundColor: accentColor }]}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Create Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
          </View>
        ) : playlists.length === 0 && !isCreating ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: inputBg }]}>
              <Ionicons name="musical-notes-outline" size={50} color={accentColor} />
            </View>
            <Text style={[styles.emptyText, { color: textColor }]}>Your music is waiting</Text>
            <Text style={styles.emptySubtext}>Create specialized playlists for your moods or workout sessions.</Text>
            <TouchableOpacity style={[styles.createFirstBtn, { backgroundColor: accentColor }]} onPress={() => setIsCreating(true)}>
              <Text style={styles.createFirstText}>Create First Playlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {playlists.map((playlist) => (
              <React.Fragment key={playlist.id}>
                {renderItem({ item: playlist })}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    marginBottom: 10,
  },
  headerButton: {
    padding: 4,
    width: 40,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
  },
  deleteBtn: {
    padding: 8,
  },
  emptyContainer: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 50,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  createFirstBtn: {
    backgroundColor: '#B34A30',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  createFirstText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createForm: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  createFormActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: "#B34A30",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loadingContainer: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});


