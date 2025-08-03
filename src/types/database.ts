export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  price: number;
  max_attendees: number;
  current_attendees: number;
  image_url?: string;
  video_url?: string;
  stream_key?: string;
  mux_playback_id?: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_live: boolean;
  is_virtual: boolean;
}

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  booking_date: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount_paid: number;
  ticket_code: string;
  qr_code?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  seat_number?: string;
  ticket_type: 'general' | 'vip' | 'premium' | 'student';
  created_at: string;
  updated_at: string;
}

export interface TicketVerification {
  id: string;
  booking_id: string;
  admin_id: string;
  event_id: string;
  verified_at: string;
  verification_method: 'qr_scan' | 'manual' | 'nfc';
  notes?: string;
  created_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  role: 'super_admin' | 'event_admin' | 'scanner' | 'theater_manager';
  permissions: string[];
  assigned_events?: string[];
  theater_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LiveStream {
  id: string;
  event_id: string;
  mux_stream_id?: string;
  mux_playback_id?: string;
  stream_key?: string;
  status: 'preparing' | 'live' | 'ended';
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export type EventCategory =
  | 'music'
  | 'sports'
  | 'technology'
  | 'food'
  | 'art'
  | 'business'
  | 'education'
  | 'entertainment';
