import { create } from 'zustand';
import { Event, Booking } from '../types/database';

interface EventsState {
  events: Event[];
  userBookings: Booking[];
  isLoading: boolean;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  setUserBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  setLoading: (loading: boolean) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  userBookings: [],
  isLoading: false,
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (eventId, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    })),
  setUserBookings: (bookings) => set({ userBookings: bookings }),
  addBooking: (booking) => set((state) => ({ userBookings: [...state.userBookings, booking] })),
  setLoading: (isLoading) => set({ isLoading }),
}));
