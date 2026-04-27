import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, FlatList } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  scrollTo
} from 'react-native-reanimated';
import { Track } from '../../types';

const { width } = Dimensions.get('window');

// Carousel Dimensions
const ITEM_WIDTH = width * 0.72;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;
const COVER_SIZE = ITEM_WIDTH;

interface AlbumArtCarouselProps {
  queue: Track[];
  currentTrack: Track;
  onTrackChange: (index: number) => void;
  currentIndex: number;
}

const CarouselItem = ({ track, index, scrollX }: { track: Track; index: number; scrollX: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
      <Animated.View style={[styles.albumArtWrapper, animatedStyle]}>
        <Image
          source={{ uri: track.image || 'https://picsum.photos/400' }}
          style={styles.albumArt}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
};

export const AlbumArtCarousel = React.memo(({
  queue,
  currentTrack,
  onTrackChange,
  currentIndex
}: AlbumArtCarouselProps) => {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Sync list position when currentTrack changes (e.g. from player controls)
  useEffect(() => {
    if (flatListRef.current && queue.length > 0) {
      flatListRef.current.scrollToOffset({
        offset: currentIndex * ITEM_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex, queue.length]);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef as any}
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: ITEM_SPACING,
          alignItems: 'center',
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
          if (newIndex !== currentIndex) {
            onTrackChange(newIndex);
          }
        }}
        renderItem={({ item, index }) => (
          <CarouselItem track={item} index={index} scrollX={scrollX} />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: width * 0.9,
    marginVertical: 20,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtWrapper: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 24,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
