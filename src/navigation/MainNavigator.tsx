import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';

import ListingsNavigator from './ListingsNavigator';
import MyListingsNavigator from './MyListingsNavigator';
import CreateListingScreen from '../screens/listings/CreateListingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Listings':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MyListings':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Create':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Listings" 
        component={ListingsNavigator}
        options={{ title: 'Anzeigen' }}
      />
      <Tab.Screen 
        name="MyListings" 
        component={MyListingsNavigator}
        options={{ title: 'Meine Anzeigen' }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateListingScreen}
        options={{ title: 'Erstellen' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}
