import { useState } from "react";
import { Track } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store/store";
import React from "react";
import { searchSongs } from "../api/api";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import { addTrackToPlaylistAction } from "../../redux/store/library/librarySlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStack } from "../../navigation/AppNavigator";

export function useLibraryScreenLogic() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const dispatch = useDispatch<AppDispatch>();

  const { likedSongs } = useSelector(
    (state: RootState) => state.library,
  );
  const activeQuery = React.useRef<string>("");

  const fetchResults = async (searchQuery: string) => {
    activeQuery.current = searchQuery;
    setLoading(true); // Fix 2: show spinner while fetching

    const localLiked = likedSongs.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    try {
      const remoteTracks = await searchSongs(searchQuery);

      if (activeQuery.current !== searchQuery) return;

      const combined = [...localLiked];
      remoteTracks.forEach((rt) => {
        if (!combined.find((lt) => lt.id === rt.id)) {
          combined.push(rt);
        }
      });

      setResults(combined);
    } catch (e) {
      if (activeQuery.current === searchQuery) {
        setResults(localLiked);
      }
    } finally {
      if (activeQuery.current === searchQuery) {
        setLoading(false);
      }
    }
  };

  const handlePlayTrack = async (track: Track) => {
    dispatch(setQueue(results));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  };

  const handleOpenPicker = (track: Track) => {
    setSelectedTrack(track);
    setIsPickerVisible(true);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedTrack) {
      dispatch(
        addTrackToPlaylistAction({
          playlistId,
          track: selectedTrack,
        }),
      );
      setIsPickerVisible(false);
      setSelectedTrack(null);
    }
  };

  return {
    query,
    setQuery,
    results,
    setResults,
    loading,
    setLoading,
    isPickerVisible,
    setIsPickerVisible,
    selectedTrack,
    likedSongs,
    fetchResults,
    handlePlayTrack,
    handleAddToPlaylist,
    handleOpenPicker,
  };
}
