import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListingsStackParamList } from '../../types/navigation';
import { Listing } from '../../types';
import * as api from '../../services/api';
import ListingCard from '../../components/listings/ListingCard';
import SearchBar from '../../components/shared/SearchBar';
import { useAuth } from '../../contexts/AuthContext';

type ListingsScreenNavigationProp = NativeStackNavigationProp<
  ListingsStackParamList,
  'ListingsList'
>;

export default function ListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<ListingsScreenNavigationProp>();
  const { user } = useAuth();

  const fetchListings = useCallback(async () => {
    try {
      setError(null);
      const response = await api.getListings({
        search: searchQuery,
        // Weitere Filter können hier hinzugefügt werden
      });
      setListings(response.listings);
    } catch (err) {
      setError('Fehler beim Laden der Anzeigen');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchListings();
  };

  const toggleFavorite = async (listingId: string) => {
    try {
      await api.toggleFavorite(listingId);
      // Aktualisiere die Anzeigenliste
      fetchListings();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Anzeigen durchsuchen..."
      />
      
      <FlatList
        data={listings}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => navigation.navigate('ListingDetails', { listing: item })}
            onFavoritePress={() => user && toggleFavorite(item.id)}
            isFavorite={user ? item.favorites.includes(user.id) : false}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Keine Anzeigen gefunden
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
});
