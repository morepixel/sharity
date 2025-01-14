import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000,
  withCredentials: true
});

// Initialize token from storage
AsyncStorage.getItem('token').then(token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response Error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error('Request Error:', error.request);
      throw new Error('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Config Error:', error);
    return Promise.reject(error);
  }
);

// Mock data for testing
const MOCK_USERS = {
  'geber@test.com': {
    id: '1',
    email: 'geber@test.com',
    username: 'Geber',
    password: 'test123',
    token: 'mock-token-geber',
    profileImage: 'https://i.pravatar.cc/150?u=geber'
  },
  'nehmer@test.com': {
    id: '2',
    email: 'nehmer@test.com',
    username: 'Nehmer',
    password: 'test123',
    token: 'mock-token-nehmer',
    profileImage: 'https://i.pravatar.cc/150?u=nehmer'
  }
};

// Auth API
export const login = async (email: string, password: string) => {
  try {
    console.log('Attempting login with:', { email, password });

    // Use mock data instead of API call
    const mockUser = MOCK_USERS[email];
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Invalid credentials');
    }

    const responseData = {
      token: mockUser.token,
      userId: mockUser.id,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username
      }
    };

    // Set token in headers and storage
    api.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
    await AsyncStorage.setItem('token', responseData.token);
    await AsyncStorage.setItem('userId', responseData.userId);
    
    console.log('Login successful:', responseData);
    return responseData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    console.log('Attempting register with:', userData);

    // Create new mock user
    const newUser = {
      id: String(Object.keys(MOCK_USERS).length + 1),
      email: userData.email,
      username: userData.username,
      password: userData.password,
      token: `mock-token-${userData.username.toLowerCase()}`
    };

    // Add to mock database
    MOCK_USERS[userData.email] = newUser;

    const responseData = {
      token: newUser.token,
      userId: newUser.id,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    };

    api.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
    await AsyncStorage.setItem('token', responseData.token);
    await AsyncStorage.setItem('userId', responseData.userId);
    
    console.log('Register successful:', responseData);
    return responseData;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User API
export const getUserProfile = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    
    // Mock profile data
    return {
      id: userId,
      username: token?.includes('geber') ? 'Geber' : 'Nehmer',
      email: token?.includes('geber') ? 'geber@test.com' : 'nehmer@test.com',
      profileImage: 'https://i.pravatar.cc/150?u=geber',
      givenItems: 5,
      receivedItems: 3,
      activeListings: 2
    };
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Sharries Points API
export const getSharriesPoints = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    
    // Mock points data
    return {
      total: 150,
      level: 2,
      nextLevel: 200
    };
  } catch (error) {
    console.error('Get points error:', error);
    throw error;
  }
};

// Listings API
export const getListings = async () => {
  try {
    // Mock listings data
    return [
      {
        id: '1',
        title: 'Vintage Fahrrad',
        description: 'Ein gut erhaltenes Vintage-Fahrrad aus den 80er Jahren. Perfekt für Stadtfahrten und Ausflüge. Das Fahrrad wurde regelmäßig gewartet und befindet sich in einem sehr guten Zustand.',
        images: ['https://picsum.photos/seed/bike/800/600'],
        location: 'Berlin',
        user: {
          username: 'Geber',
          profileImage: 'https://i.pravatar.cc/150?u=geber'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Bücher-Sammlung',
        description: 'Verschiedene Romane und Sachbücher. Eine bunte Mischung aus Klassikern, modernen Romanen und interessanten Sachbüchern. Alle Bücher sind in gutem Zustand und suchen ein neues Zuhause.',
        images: ['https://picsum.photos/seed/books/800/600'],
        location: 'München',
        user: {
          username: 'Nehmer',
          profileImage: 'https://i.pravatar.cc/150?u=nehmer'
        },
        createdAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Get listings error:', error);
    throw error;
  }
};

export const createListing = async (formData: FormData) => {
  try {
    // Mock create listing
    return {
      id: String(Date.now()),
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      images: ['https://picsum.photos/seed/' + Date.now() + '/800/600'],
      user: {
        username: 'Geber',
        profileImage: 'https://i.pravatar.cc/150?u=geber'
      },
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Create listing error:', error);
    throw error;
  }
};

export const getListing = async (id: string) => {
  try {
    // Mock get listing
    const listings = await getListings();
    const listing = listings.find(l => l.id === id);
    
    if (!listing) {
      return {
        id,
        title: 'Beispiel Listing',
        description: 'Ein Beispiel-Listing zum Testen.',
        images: ['https://picsum.photos/seed/example/800/600'],
        location: 'Hamburg',
        user: {
          username: 'Geber',
          profileImage: 'https://i.pravatar.cc/150?u=geber'
        },
        createdAt: new Date().toISOString()
      };
    }
    
    return listing;
  } catch (error) {
    console.error('Get listing error:', error);
    throw error;
  }
};

// Typen
export interface Location {
  type: 'Point';
  coordinates: [number, number];
  city: string;
  distance?: number;
}

export interface Listing {
  id: string;
  name: string;
  description: string;
  images: string[];
  mainCategory: string;
  subCategory: string;
  location: Location;
  user: {
    id: string;
    username: string;
    profileImage?: string;
    rating: number;
  };
  status: 'live' | 'pending' | 'given';
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  query?: string;
  mainCategory?: string;
  subCategory?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  status?: 'live' | 'pending' | 'given';
}

// Chats
export const getChats = async () => {
  try {
    const response = await api.get('/chats');
    console.log('Get chats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get chats error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const createChat = async (listingId: string, message: string) => {
  try {
    console.log('Attempting create chat with:', { listingId, message });
    const response = await api.post('/chats', { listingId, message });
    console.log('Create chat response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create chat error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const getChatMessages = async (chatId: string) => {
  try {
    const response = await api.get(`/chats/${chatId}/messages`);
    console.log('Get chat messages response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get chat messages error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const sendMessage = async (chatId: string, message: string) => {
  try {
    console.log('Attempting send message with:', { chatId, message });
    const response = await api.post(`/chats/${chatId}/messages`, { message });
    console.log('Send message response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

// Interceptor for token handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      logout();
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
