import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Junior Dev Component:
 * Just the top part of the home screen. 
 * Separating it makes the main HomeScreen file look much cleaner!
 */

interface HomeHeaderProps {
  onOpenDrawer: () => void;
  onNavigateLibrary: () => void;
  textColor: string;
}

export const HomeHeader = React.memo(({
  onOpenDrawer,
  onNavigateLibrary,
  textColor
}: HomeHeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onOpenDrawer}>
        <Ionicons name="menu-outline" size={28} color={textColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onNavigateLibrary}>
        <Ionicons name="search-outline" size={24} color={textColor} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
});
