import { useEffect, useCallback } from 'react';
import { useEventsStore } from '../store/events';
import { supabase } from '../lib/supabase';
import { Event, EventCategory } from '../types/database';
import { useAuthStore } from '../store/auth';

export const useEvents = () => {
  const {
    events,
    userBookings,
    isLoading,
    setEvents,
    addEvent,
    updateEvent,
    setUserBookings,
    addBooking,
    setLoading,
  } = useEventsStore();

  const { user } = useAuthStore();

  // Fetch all events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Unexpected error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [setEvents, setLoading]);

  // Fetch user bookings
  const fetchUserBookings = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.from('bookings').select('*').eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user bookings:', error);
        return;
      }

      setUserBookings(data || []);
    } catch (error) {
      console.error('Unexpected error fetching user bookings:', error);
    }
  }, [user?.id, setUserBookings]);

  // Create new event
  const createEvent = useCallback(
    async (
      eventData: Omit<
        Event,
        'id' | 'created_at' | 'updated_at' | 'current_attendees' | 'created_by'
      >
    ) => {
      if (!user?.id) throw new Error('User must be authenticated');

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .insert([
            {
              ...eventData,
              created_by: user.id,
              current_attendees: 0,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error creating event:', error);
          throw error;
        }

        addEvent(data);
        return data;
      } catch (error) {
        console.error('Unexpected error creating event:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, setLoading, addEvent]
  );

  // Book an event
  const bookEvent = useCallback(
    async (eventId: string) => {
      if (!user?.id) throw new Error('User must be authenticated');

      try {
        setLoading(true);

        // Check if user already booked this event
        const existingBooking = userBookings.find((booking) => booking.event_id === eventId);

        if (existingBooking) {
          throw new Error('You have already booked this event');
        }

        // Get event details for price
        const event = events.find((e) => e.id === eventId);
        if (!event) {
          throw new Error('Event not found');
        }

        // Create booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              payment_status: 'completed', // Simplified for demo
              amount_paid: event.price,
              booking_date: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (bookingError) {
          console.error('Error creating booking:', bookingError);
          throw bookingError;
        }

        // Update event attendees count
        const { data: updatedEvent, error: updateError } = await supabase
          .from('events')
          .update({ current_attendees: event.current_attendees + 1 })
          .eq('id', eventId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating event attendees:', updateError);
        } else {
          updateEvent(eventId, { current_attendees: updatedEvent.current_attendees });
        }

        addBooking(bookingData);
        return bookingData;
      } catch (error) {
        console.error('Unexpected error booking event:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, userBookings, events, setLoading, addBooking, updateEvent]
  );

  // Get events by category
  const getEventsByCategory = useCallback(
    (category: EventCategory) => {
      return events.filter((event) => event.category === category);
    },
    [events]
  );

  // Check if user has booked an event
  const hasUserBookedEvent = useCallback(
    (eventId: string) => {
      return userBookings.some((booking) => booking.event_id === eventId);
    },
    [userBookings]
  );

  // Get user's booked events
  const getUserBookedEvents = useCallback(() => {
    const bookedEventIds = userBookings.map((booking) => booking.event_id);
    return events.filter((event) => bookedEventIds.includes(event.id));
  }, [events, userBookings]);

  // Initialize data on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings();
    }
  }, [user?.id, fetchUserBookings]);

  return {
    events,
    userBookings,
    isLoading,
    fetchEvents,
    fetchUserBookings,
    createEvent,
    bookEvent,
    getEventsByCategory,
    hasUserBookedEvent,
    getUserBookedEvents,
  };
};
