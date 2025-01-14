import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListingsStackParamList } from '../types/navigation';

import ListingsScreen from '../screens/listings/ListingsScreen';
import ListingDetailsScreen from '../screens/listings/ListingDetailsScreen';

const Stack = createNativeStackNavigator<ListingsStackParamList>();

export default function ListingsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListingsList" 
        component={ListingsScreen}
        options={{ title: 'Kleinanzeigen' }}
      />
      <Stack.Screen 
        name="ListingDetails" 
        component={ListingDetailsScreen}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}
