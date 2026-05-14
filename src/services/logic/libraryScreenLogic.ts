import { useState, useRef } from "react";
import { Track } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store/store";
import React from "react";
import { searchSongs } from "../api/api";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import { addTrackToPlaylistAction, addToRecentSearches } from "../../redux/store/library/librarySlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStack } from "../../navigation/AppNavigator";

export function useLibraryScreenLogic() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<MainStack>>();
  const dispatch = useDispatch<AppDispatch>();

  const { likedSongs, recentSearches, homeFeed } = useSelector(
    (state: RootState) => state.library,
  );
  const { tracks: localTracks } = useSelector(
    (state: RootState) => state.localLibrary,
  );
  const activeQuery = useRef<string>("");

  const fetchResults = async (searchQuery: string) => {
    activeQuery.current = searchQuery;
    setLoading(true);

    const queryLower = searchQuery.toLowerCase();
    const localLiked = likedSongs.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.artist.toLowerCase().includes(queryLower),
    );

    const localDevice = localTracks.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.artist.toLowerCase().includes(queryLower),
    );

    try {
      const remoteTracks = await searchSongs(searchQuery);

      if (activeQuery.current !== searchQuery) return;

      const combined = [...localLiked];
      
      // Add local device tracks if not already in liked
      localDevice.forEach((lt) => {
        if (!combined.find((c) => c.id === lt.id)) {
          combined.push(lt);
        }
      });

      // Add remote tracks
      remoteTracks.forEach((rt) => {
        if (!combined.find((c) => c.id === rt.id)) {
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

  const handlePlayTrack = async (track: Track, customQueue?: Track[]) => {
    dispatch(addToRecentSearches(track));
    dispatch(setQueue(customQueue || results));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  };

  const handleOpenPicker = (track: Track) => {
    setSelectedTrack(track);
    setIsOptionsVisible(true);
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
    loading,
    isPickerVisible,
    setIsPickerVisible,
    isOptionsVisible,
    setIsOptionsVisible,
    selectedTrack,
    likedSongs,
    recentSearches,
    suggestions: homeFeed.suggestions,
    fetchResults,
    handlePlayTrack,
    handleAddToPlaylist,
    handleOpenPicker,
  };
}
