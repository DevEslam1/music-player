import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * Professional Junior Component:
 * Now supports alignment and back button! 
 * Reusable for any screen that needs an Auth-style header.
 */

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  alignCenter?: boolean;
}

export const AuthHeader = React.memo(({ title, subtitle, showBackButton, alignCenter }: AuthHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View style={[
      styles.headerContainer, 
      alignCenter && { alignItems: 'center' },
      !alignCenter && { paddingHorizontal: 24 }
    ]}>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 60,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
});
