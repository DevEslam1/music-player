import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/use-theme-color';

const { width } = Dimensions.get('window');

const ShimmerBlock = ({ style }: { style: any }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonColor = useThemeColor({}, 'skeleton'); // Assuming we have a skeleton color or just use surface
  const baseColor = skeletonColor || '#E2E8F0';

  return <Animated.View style={[style, { backgroundColor: baseColor }, animatedStyle]} />;
};

export const HomeSkeleton = () => {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <ShimmerBlock style={styles.circle} />
        <ShimmerBlock style={styles.circle} />
      </View>

      {/* Horizontal List Skeleton */}
      <View style={styles.section}>
        <ShimmerBlock style={styles.title} />
        <View style={styles.horizontalList}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.cardContainer}>
              <ShimmerBlock style={styles.card} />
              <ShimmerBlock style={styles.cardText} />
              <ShimmerBlock style={styles.cardSubText} />
            </View>
          ))}
        </View>
      </View>

      {/* Favorite Section Skeleton */}
      <View style={styles.section}>
        <ShimmerBlock style={styles.title} />
        <ShimmerBlock style={styles.largeBlock} />
      </View>

      {/* Vertical List Skeleton */}
      <View style={styles.section}>
        <View style={styles.row}>
           <ShimmerBlock style={styles.title} />
           <ShimmerBlock style={styles.smallLink} />
        </View>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.listItem}>
            <ShimmerBlock style={styles.itemSquare} />
            <View style={styles.itemMeta}>
              <ShimmerBlock style={styles.itemTitle} />
              <ShimmerBlock style={styles.itemSub} />
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
