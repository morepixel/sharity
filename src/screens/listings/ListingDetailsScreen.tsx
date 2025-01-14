import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../services/api';

const { width } = Dimensions.get('window');

export default function ListingDetailsScreen() {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const route = useRoute();
  const navigation = useNavigation();
  const listingId = route.params?.id;

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const data = await api.getListing(listingId);
      setListing(data);
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Fehler', 'Anzeige konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      await api.toggleFavorite(listingId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Fehler', 'Aktion konnte nicht ausgeführt werden');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Schau dir diese Anzeige an: ${listing.title} - ${listing.price}€\n${listing.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContact = () => {
    // TODO: Implement chat or email functionality
    Alert.alert('Kontakt', `Verkäufer kontaktieren: ${listing?.user?.email}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text>Anzeige nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              setCurrentImageIndex(Math.round(offset / width));
            }}
          >
            {listing.images.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {listing.images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {listing.images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{listing.title}</Text>
            <TouchableOpacity onPress={handleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#ff4444' : '#666'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>{listing.price}€</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="pricetag" size={20} color="#666" />
              <Text style={styles.infoText}>{listing.category}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={20} color="#666" />
              <Text style={styles.infoText}>{listing.condition}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.infoText}>{listing.location}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Beschreibung</Text>
          <Text style={styles.description}>{listing.description}</Text>

          <Text style={styles.sectionTitle}>Verkäufer</Text>
          <View style={styles.sellerContainer}>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.user.username}</Text>
              <Text style={styles.sellerDate}>
                Mitglied seit {new Date(listing.user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, styles.messageButton]}
          onPress={handleContact}
        >
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}>Nachricht</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
        >
          <Ionicons name="share" size={20} color="#2196F3" />
          <Text style={[styles.buttonText, styles.shareButtonText]}>Teilen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: width * 0.75,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width,
    height: width * 0.75,
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sellerInfo: {
    marginLeft: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sellerDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  messageButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButtonText: {
    color: '#2196F3',
  },
});
