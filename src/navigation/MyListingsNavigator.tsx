import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyListingsStackParamList } from '../types/navigation';

import MyListingsScreen from '../screens/listings/MyListingsScreen';
import EditListingScreen from '../screens/listings/EditListingScreen';

const Stack = createNativeStackNavigator<MyListingsStackParamList>();

export default function MyListingsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyListingsList" 
        component={MyListingsScreen}
        options={{ title: 'Meine Anzeigen' }}
      />
      <Stack.Screen 
        name="EditListing" 
        component={EditListingScreen}
        options={{ title: 'Anzeige bearbeiten' }}
      />
    </Stack.Navigator>
  );
}
