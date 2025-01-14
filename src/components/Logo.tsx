import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const SIZES = {
  small: {
    icon: 24,
    text: 16
  },
  medium: {
    icon: 32,
    text: 24
  },
  large: {
    icon: 48,
    text: 36
  }
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  color = theme.colors.primary 
}) => {
  return (
    <View style={styles.container}>
      <Ionicons 
        name="gift-outline" 
        size={SIZES[size].icon} 
        color={color} 
      />
      <Text style={[
        styles.text, 
        { fontSize: SIZES[size].text, color }
      ]}>
        Sharity
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  text: {
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
