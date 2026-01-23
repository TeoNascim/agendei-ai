
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface PortfolioPost {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  timestamp: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  category: string;
  bio: string;
  avatar: string;
  coverImage: string;
  services: Service[];
  portfolio: PortfolioPost[];
  reviews: Review[];
  availableSlots: string[];
}

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  clientName: string;
  startTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  price: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}
