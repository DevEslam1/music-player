import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store/store';
import { 
  selectIsDownloaded, 
  selectDownloadProgress,
  removeDownload as removeDownloadAction,
  setDownloadProgress,
  upsertDownload,
  clearDownloadProgress
} from '../redux/store/downloads/downloadsSlice';
import { DownloadService } from '../services/api/downloadService';
import { useAccentColor } from '../hooks/use-theme-color';
import { Track } from '../types';
import * as Haptics from 'expo-haptics';
import { showAppBanner } from './OfflineBanner';

interface DownloadButtonProps {
  track: Track;
  size?: number;
  color?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  track,
  size = 24,
  color: propColor,
}) => {
  const accentColor = useAccentColor();
  const color = propColor || accentColor;
  const isDownloaded = useSelector((state: RootState) => selectIsDownloaded(state, track.id));
  const downloadProgress = useSelector((state: RootState) => selectDownloadProgress(state, track.id));
  const dispatch = useDispatch();

  const handlePress = async () => {
    if (isDownloaded) {
      showAppBanner('Removing from offline library…', 'info');
      await DownloadService.removeDownload(track.id);
      dispatch(removeDownloadAction(track.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAppBanner('Track removed from downloads.', 'success');
      return;
    }

    if (downloadProgress?.status === 'downloading') {
      await DownloadService.cancelDownload(track.id);
      dispatch(clearDownloadProgress(track.id));
      showAppBanner('Download cancelled.', 'info');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showAppBanner('Starting download…', 'info');
      dispatch(setDownloadProgress({ trackId: track.id, progress: 0, status: 'downloading' }));
      
      DownloadService.downloadTrack(track).catch(e => {
        console.warn('DownloadTrack failed:', e);
      });
    } catch (e: any) {
      dispatch(setDownloadProgress({ trackId: track.id, progress: 0, status: 'error', errorMessage: e.message }));
      showAppBanner(e.message || 'Download failed.', 'error');
    }
  };

  if (downloadProgress?.status === 'downloading') {
    const percentage = Math.round((downloadProgress.progress || 0) * 100);
    return (
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={color} />
          {percentage > 0 && (
            <Text style={[styles.progressText, { color }]}>{percentage}%</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons
        name={isDownloaded ? 'checkmark-circle' : 'cloud-download-outline'}
        size={size}
        color={isDownloaded ? '#22C55E' : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
