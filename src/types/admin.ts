// Admin-specific types
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'staff';
  theater_id?: string;
  permissions: AdminPermission[];
  created_at: string;
  last_login?: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string; // 'events', 'tickets', 'reports', 'users'
  action: string; // 'read', 'write', 'delete', 'admin'
}

// Event types for admin
export interface AdminEvent {
  id: string;
  name: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  theater_id: string;
  max_capacity: number;
  ticket_types: TicketType[];
  status: 'draft' | 'published' | 'sold_out' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  created_by: string;
  total_tickets_sold: number;
  total_checked_in: number;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  max_quantity: number;
  sold_quantity: number;
  description?: string;
  color: string;
}

// Ticket and attendee types
export interface Ticket {
  id: string;
  event_id: string;
  ticket_type_id: string;
  attendee_id: string;
  qr_code: string;
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  purchased_at: string;
  used_at?: string;
  price_paid: number;
  purchase_reference: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  event_id: string;
  ticket_id: string;
  checked_in: boolean;
  check_in_time?: string;
  check_in_admin_id?: string;
  notes?: string;
  created_at: string;
}

// Scanner types
export interface ScanResult {
  ticket_id: string;
  attendee_id: string;
  event_id: string;
  scan_time: string;
  admin_id: string;
  status: 'success' | 'already_used' | 'invalid' | 'expired' | 'wrong_event';
  message: string;
}

// Report types
export interface EventReport {
  event_id: string;
  event_name: string;
  total_capacity: number;
  tickets_sold: number;
  tickets_checked_in: number;
  revenue: number;
  check_in_rate: number;
  hourly_check_ins: HourlyCheckIn[];
  ticket_type_breakdown: TicketTypeBreakdown[];
}

export interface HourlyCheckIn {
  hour: string;
  count: number;
}

export interface TicketTypeBreakdown {
  ticket_type: string;
  sold: number;
  checked_in: number;
  revenue: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateEventFormData {
  name: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_capacity: number;
  ticket_types: Omit<TicketType, 'id' | 'sold_quantity'>[];
}

// Database types
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at'>;
        Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
      };
      events: {
        Row: AdminEvent;
        Insert: Omit<AdminEvent, 'id' | 'created_at' | 'updated_at' | 'total_tickets_sold' | 'total_checked_in'>;
        Update: Partial<Omit<AdminEvent, 'id' | 'created_at'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'purchased_at'>;
        Update: Partial<Omit<Ticket, 'id' | 'purchased_at'>>;
      };
      attendees: {
        Row: Attendee;
        Insert: Omit<Attendee, 'id' | 'created_at'>;
        Update: Partial<Omit<Attendee, 'id' | 'created_at'>>;
      };
    };
  };
}
