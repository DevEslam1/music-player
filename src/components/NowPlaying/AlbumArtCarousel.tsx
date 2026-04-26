import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { Track } from '../../types';

const { width } = Dimensions.get('window');

/**
 * Hi there! I'm a Junior developer sub-component. 
 * I handle the swipable album art carousel using PagerView.
 * 
 * Logic:
 * - We map over the queue and show an image for each track.
 * - We use Animated.Image so we can scale it up when music is playing!
 */

interface AlbumArtCarouselProps {
  queue: Track[];
  currentTrack: Track;
  pagerRef: React.RefObject<PagerView>;
  initialPageIndex: number;
  onPageSelected: (e: any) => void;
  animatedImageStyle: any;
}

export const AlbumArtCarousel = React.memo(({
  queue,
  currentTrack,
  pagerRef,
  initialPageIndex,
  onPageSelected,
  animatedImageStyle
}: AlbumArtCarouselProps) => {
  return (
    <View style={styles.carouselContainer}>
      {queue.length > 0 ? (
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={initialPageIndex}
          onPageSelected={onPageSelected}
        >
          {queue.map((track, index) => (
            <View key={`${track.id}-${index}`} style={styles.page}>
              <View style={styles.albumArtShadow}>
                <Animated.Image
                  source={{ uri: track.image || 'https://picsum.photos/400' }}
                  style={[styles.albumArt, animatedImageStyle]}
                />
              </View>
            </View>
          ))}
        </PagerView>
      ) : (
        <View style={styles.page}>
          <View style={styles.albumArtShadow}>
            <Animated.Image
              source={{ uri: currentTrack.image || 'https://picsum.photos/400' }}
              style={[styles.albumArt, animatedImageStyle]}
            />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  carouselContainer: {
    height: width * 0.85,
    marginBottom: 20,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 20,
    backgroundColor: '#000',
    borderRadius: 24,
  },
  albumArt: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 24,
  },
});
