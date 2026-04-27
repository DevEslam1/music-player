import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store/store";
import React from "react";
import { Track } from "../../types";
import { setQueue } from "../../redux/store/player/playerSlice";
import { audioPlayer } from "../audio/AudioPlayerService";
import {
  selectLikedSongsLoading,
  toggleLikeSongAction,
} from "../../redux/store/library/librarySlice";
import { useNavigation } from "@react-navigation/native";

export function likedScreenLogic() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const likedSongs = useSelector((state: RootState) => state.library.likedSongs);
  const loading = useSelector(selectLikedSongsLoading);
  const [isEditMode, setIsEditMode] = React.useState(false);

  const handlePlay = async (track: Track) => {
    if (isEditMode) return; 
    dispatch(setQueue(likedSongs));
    await audioPlayer.loadPlayTrack(track);
    navigation.navigate("NowPlaying");
  };

  const handleRemove = (track: Track) => {
    dispatch(toggleLikeSongAction(track));
  };

  return {
    likedSongs,
    loading,
    isEditMode,
    dispatch,
    setIsEditMode,
    handlePlay,
    handleRemove,
  };
}
