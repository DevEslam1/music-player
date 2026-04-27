import { useCallback } from "react";
import { Track } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import { AppDispatch } from "../../redux/store/store";

/**
 * Junior Developer Logic Note:
 * I added 'useCallback' here to make our app faster! 
 * It remembers the function so React doesn't have to rebuild it 
 * every single time the screen refreshes. Efficiency! ⚡
 */

export function homeScreenLogic() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const handlePlayTrack = useCallback(async (track: Track, queue: Track[]) => {
    dispatch(setQueue(queue));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  }, [dispatch, navigation]);

  return {
    handlePlayTrack,
  };
}
