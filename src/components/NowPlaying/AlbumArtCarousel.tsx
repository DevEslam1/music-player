import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Track } from '../../types';

const { width } = Dimensions.get('window');

// Cover is 85% of screen width — larger and more immersive than before
const COVER_SIZE = width * 0.85;

/**
 * 3-layer structure (unchanged from bug fixes):
 *   Animated.View  → scale animation, NO overflow:hidden (zoom not clipped)
 *   Inner View     → overflow:hidden + borderRadius (clips image cleanly)
 *   Image          → the actual artwork
 *
 * NEW: A 4th layer — an Animated glow view sits BEHIND the artwork and
 * fades in/out with glowIntensity (0→1) when the track starts/stops playing.
 */

interface AlbumArtCarouselProps {
  queue: Track[];
  currentTrack: Track;
  pagerRef: React.RefObject<PagerView | null>;
  initialPageIndex: number;
  onPageSelected: (e: any) => void;
  animatedImageStyle: any;
  glowIntensity: SharedValue<number>;
}

const AlbumArtPage = React.memo(({
  track,
  animatedImageStyle,
  glowStyle,
}: {
  track: Track;
  animatedImageStyle: any;
  glowStyle: any;
}) => (
  <View style={styles.page}>
    {/* Warm glow behind the artwork — fades in when playing */}
    <Animated.View style={[styles.glow, glowStyle]} />

    {/* Layer 1: Animated.View — scale animation + shadow. NO overflow:hidden */}
    <Animated.View style={[styles.albumArtShadow, animatedImageStyle]}>
      {/* Layer 2: clips image corners without cutting the outer scale */}
      <View style={styles.albumArtClip}>
        {/* Layer 3: the actual cover art */}
        <Image
          source={{ uri: track.image || 'https://picsum.photos/400' }}
          style={styles.albumArt}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  </View>
));

export const AlbumArtCarousel = React.memo(({
  queue,
  currentTrack,
  pagerRef,
  initialPageIndex,
  onPageSelected,
  animatedImageStyle,
  glowIntensity,
}: AlbumArtCarouselProps) => {
  // Animated style for the glow — driven by glowIntensity (0→1)
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value * 0.55,
    transform: [{ scale: 0.85 + glowIntensity.value * 0.15 }],
  }));

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
            <AlbumArtPage
              key={`${track.id}-${index}`}
              track={track}
              animatedImageStyle={animatedImageStyle}
              glowStyle={glowStyle}
            />
          ))}
        </PagerView>
      ) : (
        <AlbumArtPage
          track={currentTrack}
          animatedImageStyle={animatedImageStyle}
          glowStyle={glowStyle}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  // Container is slightly taller than COVER_SIZE to give the glow room
  carouselContainer: {
    height: COVER_SIZE + 32,
    marginBottom: 12,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Glow: a large blurred circle behind the artwork.
  // We simulate blur with a very large borderRadius and lower opacity.
  glow: {
    position: 'absolute',
    width: COVER_SIZE * 1.1,
    height: COVER_SIZE * 1.1,
    borderRadius: COVER_SIZE * 0.55,
    backgroundColor: '#B34A30',
  },

  // Layer 1: handles scale animation + drop shadow
  // backgroundColor matches app dark bg so any corner bleed is invisible
  // NO overflow:hidden → scale expands freely
  albumArtShadow: {
    shadowColor: '#B34A30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
  },

  // Layer 2: clips the image to rounded corners
  albumArtClip: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 28,
    overflow: 'hidden',
  },

  // Layer 3: the artwork itself
  albumArt: {
    width: COVER_SIZE,
    height: COVER_SIZE,
  },
});
