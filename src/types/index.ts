export interface User {
  id: string;
  username: string;
  email: string;
  location: string;
  profileImage?: string;
  ratings?: Rating[];
}

export interface Rating {
  rating: number;
  comment?: string;
  from: User;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: Image[];
  location: string;
  seller: User;
  status: 'aktiv' | 'verkauft' | 'reserviert' | 'inaktiv';
  views: number;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  url: string;
  isMain: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
