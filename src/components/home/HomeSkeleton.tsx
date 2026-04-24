import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/use-theme-color';

const { width } = Dimensions.get('window');

// Single shared opacity to drive ALL shimmer blocks from one animation
// instead of one animation per block — critical for low-end devices
const useShimmerOpacity = () => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 900 }),
        withTiming(0.3, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);
  return opacity;
};

const ShimmerBlock = ({
  style,
  opacity,
  baseColor,
}: {
  style: any;
  opacity: SharedValue<number>;
  baseColor: string;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  return (
    <Animated.View style={[style, { backgroundColor: baseColor }, animatedStyle]} />
  );
};

export const HomeSkeleton = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const skeletonColor = useThemeColor({}, 'skeleton') || '#E2E8F0';

  // One shared opacity for ALL shimmer blocks — saves many animation threads
  const opacity = useShimmerOpacity();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <ShimmerBlock style={styles.circle} opacity={opacity} baseColor={skeletonColor} />
        <ShimmerBlock style={styles.circle} opacity={opacity} baseColor={skeletonColor} />
      </View>

      {/* Horizontal List Skeleton */}
      <View style={styles.section}>
        <ShimmerBlock style={styles.title} opacity={opacity} baseColor={skeletonColor} />
        <View style={styles.horizontalList}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.cardContainer}>
              <ShimmerBlock style={styles.card} opacity={opacity} baseColor={skeletonColor} />
              <ShimmerBlock style={styles.cardText} opacity={opacity} baseColor={skeletonColor} />
              <ShimmerBlock style={styles.cardSubText} opacity={opacity} baseColor={skeletonColor} />
            </View>
          ))}
        </View>
      </View>

      {/* Favorite Section Skeleton */}
      <View style={styles.section}>
        <ShimmerBlock style={styles.title} opacity={opacity} baseColor={skeletonColor} />
        <ShimmerBlock style={styles.largeBlock} opacity={opacity} baseColor={skeletonColor} />
      </View>

      {/* Vertical List Skeleton */}
      <View style={styles.section}>
        <View style={styles.row}>
          <ShimmerBlock style={styles.title} opacity={opacity} baseColor={skeletonColor} />
          <ShimmerBlock style={styles.smallLink} opacity={opacity} baseColor={skeletonColor} />
        </View>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.listItem}>
            <ShimmerBlock style={styles.itemSquare} opacity={opacity} baseColor={skeletonColor} />
            <View style={styles.itemMeta}>
              <ShimmerBlock style={styles.itemTitle} opacity={opacity} baseColor={skeletonColor} />
              <ShimmerBlock style={styles.itemSub} opacity={opacity} baseColor={skeletonColor} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    width: 200,
    height: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  horizontalList: {
    flexDirection: 'row',
    gap: 16,
  },
  cardContainer: {
    width: 140,
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 24,
    marginBottom: 12,
  },
  cardText: {
    width: 100,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  cardSubText: {
    width: 60,
    height: 12,
    borderRadius: 4,
  },
  largeBlock: {
    width: '100%',
    height: 80,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallLink: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemSquare: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 16,
  },
  itemMeta: {
    flex: 1,
    gap: 8,
  },
  itemTitle: {
    width: '70%',
    height: 14,
    borderRadius: 4,
  },
  itemSub: {
    width: '40%',
    height: 12,
    borderRadius: 4,
  },
});
