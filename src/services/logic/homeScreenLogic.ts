import { useState } from "react";
import { Track } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";

export function homeScreenLogic() {
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handlePlayTrack = async (track: Track, queue: Track[]) => {
    dispatch(setQueue(queue));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  };

  return {
    recommended,
    setRecommended,
    suggestions,
    setSuggestions,
    loading,
    setLoading,
    handlePlayTrack,
  };
}
