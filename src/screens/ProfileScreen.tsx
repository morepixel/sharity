import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, getSharriesPoints, logout } from '../services/api';
import { SharriesPoints } from '../components/profile/SharriesPoints';
import { theme } from '../theme';

export function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profileData, pointsData] = await Promise.all([
        getUserProfile(),
        getSharriesPoints()
      ]);
      setProfile(profileData);
      setPoints(pointsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: profile?.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{profile?.username}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>
      </View>

      {points && (
        <SharriesPoints
          points={points.total}
          level={points.level}
          onInfoPress={() => {
            // TODO: Show points info modal
          }}
        />
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.givenItems || 0}</Text>
          <Text style={styles.statLabel}>Verschenkt</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.receivedItems || 0}</Text>
          <Text style={styles.statLabel}>Erhalten</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.activeListings || 0}</Text>
          <Text style={styles.statLabel}>Aktiv</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
        <Text style={styles.logoutText}>Ausloggen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.lg
  },
  userInfo: {
    flex: 1
  },
  username: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  email: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.md,
    ...theme.shadows.sm
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.md,
    ...theme.shadows.sm
  },
  logoutText: {
    ...theme.typography.body1,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm
  }
});
