import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

interface ListingItemProps {
  listing: {
    id: string;
    title: string;
    description: string;
    images: string[];
    location: string;
    user: {
      username: string;
      profileImage: string;
    };
    createdAt: string;
  };
}

export const ListingItem: React.FC<ListingItemProps> = ({ listing }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ListingDetail', { id: listing.id });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {listing.images && listing.images.length > 0 && (
        <Image
          source={{ uri: listing.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.location}>{listing.location}</Text>
        </View>

        <View style={styles.userContainer}>
          <Image
            source={{ uri: listing.user.profileImage }}
            style={styles.userImage}
          />
          <Text style={styles.username}>{listing.user.username}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    overflow: 'hidden',
    ...theme.shadows.sm
  },
  image: {
    width: '100%',
    height: width * 0.5,
    resizeMode: 'cover'
  },
  content: {
    padding: theme.spacing.md
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    ...theme.typography.h3,
    color: theme.colors.text.primary
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  location: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.xs
  },
  username: {
    fontSize: 14,
    color: theme.colors.text.secondary
  }
});
