import { NavigatorScreenParams } from '@react-navigation/native';
import { Listing } from './index';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Listings: NavigatorScreenParams<ListingsStackParamList>;
  MyListings: NavigatorScreenParams<MyListingsStackParamList>;
  Create: undefined;
  Profile: undefined;
};

export type ListingsStackParamList = {
  ListingsList: undefined;
  ListingDetails: { listing: Listing };
};

export type MyListingsStackParamList = {
  MyListingsList: undefined;
  EditListing: { listing: Listing };
};
