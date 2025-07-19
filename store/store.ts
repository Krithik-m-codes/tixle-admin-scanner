import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

// Auth Store
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
}));

// Event Store
export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  qr_codes?: string[];
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  checked_in: boolean;
  check_in_time?: string;
  event_id: string;
}

export interface EventState {
  events: Event[];
  currentEvent: Event | null;
  scannedAttendees: Attendee[];
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  addScannedAttendee: (attendee: Attendee) => void;
  updateAttendeeCheckIn: (attendeeId: string, checkedIn: boolean) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  currentEvent: null,
  scannedAttendees: [],
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  addScannedAttendee: (attendee) =>
    set((state) => ({
      scannedAttendees: [...state.scannedAttendees, attendee],
    })),
  updateAttendeeCheckIn: (attendeeId, checkedIn) =>
    set((state) => ({
      scannedAttendees: state.scannedAttendees.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              checked_in: checkedIn,
              check_in_time: checkedIn ? new Date().toISOString() : undefined,
            }
          : attendee
      ),
    })),
}));
