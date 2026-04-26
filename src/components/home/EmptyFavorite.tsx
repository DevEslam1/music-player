import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Junior Dev Component:
 * Shown when the user doesn't have any liked songs yet. 
 * Encourages them to heart some tracks! ❤️
 */

interface EmptyFavoriteProps {
  onPress: () => void;
}

export const EmptyFavorite = React.memo(({ onPress }: EmptyFavoriteProps) => {
  return (
    <TouchableOpacity style={styles.emptyFavorite} onPress={onPress}>
      <Ionicons name="heart-outline" size={24} color="#B34A30" />
      <Text style={styles.emptyFavoriteText}>
        Tap ❤️ on a song to see it here
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  emptyFavorite: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(179, 74, 48, 0.05)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B34A30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyFavoriteText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
