import { useState, useCallback } from "react";
import { Track } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";

/**
 * Junior Developer Logic Note:
 * I added 'useCallback' here to make our app faster! 
 * It remembers the function so React doesn't have to rebuild it 
 * every single time the screen refreshes. Efficiency! ⚡
 */

export function homeScreenLogic() {
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [fullSuggestions, setFullSuggestions] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handlePlayTrack = useCallback(async (track: Track, queue: Track[]) => {
    dispatch(setQueue(queue));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  }, [dispatch, navigation]);

  return {
    recommended,
    setRecommended,
    suggestions,
    setSuggestions,
    fullSuggestions,
    setFullSuggestions,
    loading,
    setLoading,
    handlePlayTrack,
  };
}
