
import { Provider, PortfolioPost, Appointment } from './types.ts';

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Barbearia Vintage & Estilo',
    slug: 'barbearia-vintage',
    category: 'Barbearia',
    bio: 'Especialistas em barbas clássicas e cortes modernos. No mercado desde 2015 proporcionando a melhor experiência.',
    avatar: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    services: [
      { id: 's1', name: 'Corte de Cabelo', price: 50, duration: 45, description: 'Corte completo com lavagem.' },
      { id: 's2', name: 'Barba Terapia', price: 40, duration: 30, description: 'Toalha quente e óleos.' }
    ],
    portfolio: [],
    reviews: [
      { id: 'r1', userName: 'João Silva', userAvatar: 'https://i.pravatar.cc/150?u=1', rating: 5, comment: 'Top demais!', date: '2023-10-15' }
    ],
    availableSlots: ['2024-06-01T10:00:00Z', '2024-06-01T11:00:00Z']
  }
];

export const MOCK_POSTS: PortfolioPost[] = [
  {
    id: 'post1',
    providerId: 'p1',
    providerName: 'Barbearia Vintage',
    providerAvatar: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=50&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1621605815841-2cd6066f4132?auto=format&fit=crop&w=600&q=80',
    caption: 'Degradê finalizado hoje! O que acharam desse fade? 🔥 #barber #fade',
    likes: 124,
    commentsCount: 12,
    timestamp: '2024-05-25T10:00:00Z'
  }
];
