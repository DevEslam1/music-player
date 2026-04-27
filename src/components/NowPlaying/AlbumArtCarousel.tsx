import { Image } from "expo-image";
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, Platform, useWindowDimensions } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  SharedValue
} from 'react-native-reanimated';
import { Track } from '../../types';
import { useAccentColor } from '../../hooks/use-theme-color';

// Carousel Dimensions
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
  itemWidth,
  coverSize,
}: { 
  track: Track; 
  index: number; 
  scrollX: SharedValue<number>;
  animatedImageStyle?: any;
  glowIntensity?: SharedValue<number>;
  itemWidth: number;
  coverSize: number;
}) => {
  const scrollAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
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
    const distance = Math.abs(scrollX.value - (index * itemWidth));
    const opacityMult = interpolate(distance, [0, itemWidth / 2], [1, 0], Extrapolate.CLAMP);

    return {
      opacity: glowIntensity.value * 0.4 * opacityMult,
      transform: [{ scale: 1.15 }],
    };
  });

  return (
    <View style={[styles.itemContainer, { width: itemWidth }]}>
      {/* Background layer for the glow */}
      <View 
        style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: -1 }]}
        pointerEvents="none"
      >
        <Animated.Image 
          source={{ uri: track.image || 'https://picsum.photos/400' }}
          style={[
            styles.glowBackground, 
            glowStyle,
            { width: coverSize, height: coverSize, borderRadius: coverSize }
          ]}
          blurRadius={Platform.OS === 'ios' ? 60 : 30}
        />
      </View>

      {/* Main Artwork Container */}
      <Animated.View style={[styles.albumArtWrapper, scrollAnimatedStyle, { width: coverSize, height: coverSize, zIndex: 10 }]}>
        <Animated.View style={animatedImageStyle}>
          <Image
            source={{ uri: track.image || 'https://picsum.photos/400' }}
            style={[styles.albumArt, { width: coverSize, height: coverSize, borderRadius: 24 }]}
            contentFit="cover"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export const AlbumArtCarousel = React.memo(({
  queue,
  currentTrack,
  onTrackChange,
  currentIndex,
  animatedImageStyle,
  glowIntensity
}: AlbumArtCarouselProps) => {
  const accentColor = useAccentColor();
  const { width } = useWindowDimensions();
  const itemWidth = width * 0.72;
  const itemSpacing = (width - itemWidth) / 2;
  const coverSize = itemWidth;
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
        offset: currentIndex * itemWidth,
        animated: true,
      });
    }
  }, [currentIndex, itemWidth, queue.length]);

  return (
    <View style={[styles.container, { height: coverSize + 40 }]}>
      <Animated.FlatList
        ref={flatListRef as any}
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: itemSpacing,
          alignItems: 'center',
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / itemWidth);
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
            itemWidth={itemWidth}
            coverSize={coverSize}
          />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtWrapper: {
    borderRadius: 24,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  albumArt: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glowBackground: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1, // Ensure it's behind the cover
  },
});
