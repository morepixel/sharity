import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from './Logo';
import { theme } from '../theme';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onNotificationPress
}) => {
  return (
    <View style={styles.container}>
      <Logo size="small" color={theme.colors.text.inverse} />
      <View style={styles.actions}>
        <TouchableOpacity onPress={onSearchPress} style={styles.button}>
          <Ionicons 
            name="search-outline" 
            size={24} 
            color={theme.colors.text.inverse} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNotificationPress} style={styles.button}>
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color={theme.colors.text.inverse} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  button: {
    padding: theme.spacing.xs
  }
});
