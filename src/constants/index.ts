export const APP_CONFIG = {
  name: 'Tixle',
  description: 'Event booking and streaming platform',
  version: '1.0.0',
  colors: {
    primary: '#4F46E5',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  oauth: {
    redirectScheme: 'tixle-mobile',
    redirectPath: 'auth/callback',
  },
};

export const EVENT_CATEGORIES = [
  { id: 'music', label: 'Music', icon: 'musical-notes', color: '#8B5CF6' },
  { id: 'sports', label: 'Sports', icon: 'football', color: '#10B981' },
  { id: 'technology', label: 'Technology', icon: 'laptop', color: '#3B82F6' },
  { id: 'food', label: 'Food & Drink', icon: 'restaurant', color: '#F59E0B' },
  { id: 'art', label: 'Arts & Culture', icon: 'brush', color: '#EF4444' },
  { id: 'business', label: 'Business', icon: 'briefcase', color: '#6366F1' },
  { id: 'education', label: 'Education', icon: 'school', color: '#14B8A6' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film', color: '#F97316' },
] as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const STREAM_STATUS = {
  PREPARING: 'preparing',
  LIVE: 'live',
  ENDED: 'ended',
} as const;
