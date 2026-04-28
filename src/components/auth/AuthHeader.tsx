import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '../../hooks/use-theme-color';



interface AuthHeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  alignCenter?: boolean;
}

export const AuthHeader = React.memo(({ title, subtitle, showBackButton, alignCenter }: AuthHeaderProps) => {
  const navigation = useNavigation();
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor(
    { light: "#475569", dark: "#94A3B8" },
    "text",
  );
  const buttonColor = useThemeColor(
    { light: "#FFFFFF", dark: "rgba(255,255,255,0.06)" },
    "surface",
  );

  return (
    <View style={[
      styles.headerContainer, 
      alignCenter && { alignItems: 'center' },
      !alignCenter && { paddingHorizontal: 24 }
    ]}>
      {showBackButton && (
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: buttonColor }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>
      )}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: mutedTextColor }]}>{subtitle}</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});
