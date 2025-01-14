import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { theme } from '../../theme';

interface LocationSearchProps {
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    radius: number;
  } | null) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationChange
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radius, setRadius] = useState(10); // Default 10km
  const [locationEnabled, setLocationEnabled] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        setLocationEnabled(true);
        onLocationChange({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          radius
        });
      } else {
        Alert.alert(
          'Standort nicht verfügbar',
          'Bitte erlaube den Zugriff auf deinen Standort in den Einstellungen.'
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Fehler',
        'Dein Standort konnte nicht ermittelt werden.'
      );
    }
  };

  const toggleLocation = () => {
    if (locationEnabled) {
      setLocation(null);
      setLocationEnabled(false);
      onLocationChange(null);
    } else {
      requestLocationPermission();
    }
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    if (location) {
      onLocationChange({
        ...location,
        radius: value
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          locationEnabled && styles.buttonActive
        ]}
        onPress={toggleLocation}
      >
        <Ionicons
          name={locationEnabled ? "location" : "location-outline"}
          size={24}
          color={locationEnabled ? theme.colors.primary : theme.colors.text.secondary}
        />
        <Text style={[
          styles.buttonText,
          locationEnabled && styles.buttonTextActive
        ]}>
          {locationEnabled ? 'Standort aktiv' : 'Standort aktivieren'}
        </Text>
      </TouchableOpacity>

      {locationEnabled && (
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>
            Umkreis: {radius} km
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={radius}
            onValueChange={handleRadiusChange}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.text.disabled}
            thumbTintColor={theme.colors.primary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface
  },
  buttonActive: {
    backgroundColor: theme.colors.primary + '20' // 20% opacity
  },
  buttonText: {
    ...theme.typography.body1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text.secondary
  },
  buttonTextActive: {
    color: theme.colors.primary
  },
  radiusContainer: {
    marginTop: theme.spacing.md
  },
  radiusLabel: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  slider: {
    width: '100%',
    height: 40
  }
});
