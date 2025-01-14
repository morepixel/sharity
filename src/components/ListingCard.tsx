import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ListingCardProps {
  listing: {
    id: string;
    name: string;
    images: string[];
    mainCategory: string;
    subCategory: string;
    location: string;
    distance: number;
    isFavorite?: boolean;
  };
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  onFavoritePress
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, theme.shadows.sm]} 
      onPress={onPress}
    >
      <Image
        source={{ uri: listing.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.name}
          </Text>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={onFavoritePress}
          >
            <Ionicons
              name={listing.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={listing.isFavorite ? theme.colors.accent : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>
              {listing.mainCategory} • {listing.subCategory}
            </Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.location}>
              {listing.location} ({listing.distance}km)
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.surface
  },
  content: {
    padding: theme.spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm
  },
  title: {
    flex: 1,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm
  },
  favoriteButton: {
    padding: theme.spacing.xs
  },
  details: {
    gap: theme.spacing.xs
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  category: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  location: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary
  }
});
