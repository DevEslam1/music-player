import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, FlatList, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  SharedValue
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
  animatedImageStyle?: any;
  glowIntensity?: SharedValue<number>;
}

const CarouselItem = ({ 
  track, 
  index, 
  scrollX, 
  animatedImageStyle,
  glowIntensity,
  accentColor 
}: { 
  track: Track; 
  index: number; 
  scrollX: SharedValue<number>;
  animatedImageStyle?: any;
  glowIntensity?: SharedValue<number>;
  accentColor: string;
}) => {
  const scrollAnimatedStyle = useAnimatedStyle(() => {
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

  const glowStyle = useAnimatedStyle(() => {
    if (!glowIntensity) return { opacity: 0 };
    
    // Only show glow if this is the active-ish item
    const distance = Math.abs(scrollX.value - (index * ITEM_WIDTH));
    const opacityMult = interpolate(distance, [0, ITEM_WIDTH / 2], [1, 0], Extrapolate.CLAMP);

    return {
      opacity: glowIntensity.value * 0.4 * opacityMult,
      transform: [{ scale: 1.15 }],
    };
  });

  return (
    <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
      {/* Background layer for the glow */}
      <View 
        style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: -1 }]}
        pointerEvents="none"
      >
        <Animated.Image 
          source={{ uri: track.image || 'https://picsum.photos/400' }}
          style={[
            styles.glowBackground, 
            glowStyle
          ]}
          blurRadius={Platform.OS === 'ios' ? 60 : 30}
        />
      </View>

      {/* Main Artwork Container */}
      <Animated.View style={[styles.albumArtWrapper, scrollAnimatedStyle, { zIndex: 10 }]}>
        <Animated.View style={animatedImageStyle}>
          <Image
            source={{ uri: track.image || 'https://picsum.photos/400' }}
            style={styles.albumArt}
            resizeMode="cover"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

import { useAccentColor } from '../../hooks/use-theme-color';

export const AlbumArtCarousel = React.memo(({
  queue,
  currentTrack,
  onTrackChange,
  currentIndex,
  animatedImageStyle,
  glowIntensity
}: AlbumArtCarouselProps) => {
  const accentColor = useAccentColor();
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
          <CarouselItem 
            track={item} 
            index={index} 
            scrollX={scrollX} 
            animatedImageStyle={index === currentIndex ? animatedImageStyle : undefined}
            glowIntensity={index === currentIndex ? glowIntensity : undefined}
            accentColor={accentColor}
          />
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
  glowBackground: {
    position: 'absolute',
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: COVER_SIZE,
    opacity: 0,
    zIndex: -1, // Ensure it's behind the cover
  },
});
