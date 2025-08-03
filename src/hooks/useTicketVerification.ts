import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface TicketVerification {
  id: string;
  booking_id: string;
  admin_id: string;
  event_id: string;
  verified_at: string;
  verification_method: 'qr_scan' | 'manual' | 'nfc';
  notes?: string;
  created_at: string;
}

interface VerificationStats {
  totalVerifications: number;
  todayVerifications: number;
  weeklyVerifications: number;
  monthlyVerifications: number;
}

export const useTicketVerification = () => {
  const { user } = useAuthStore();
  const [verifications, setVerifications] = useState<TicketVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<VerificationStats>({
    totalVerifications: 0,
    todayVerifications: 0,
    weeklyVerifications: 0,
    monthlyVerifications: 0,
  });

  // Fetch verification history
  const fetchVerifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ticket_verifications')
        .select(`
          *,
          bookings (
            id,
            ticket_code,
            events (
              id,
              title,
              location
            )
          )
        `)
        .eq('admin_id', user.id)
        .order('verified_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Calculate verification stats
  const calculateStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    const todayCount = verifications.filter(v => 
      new Date(v.verified_at) >= today
    ).length;

    const weeklyCount = verifications.filter(v => 
      new Date(v.verified_at) >= weekAgo
    ).length;

    const monthlyCount = verifications.filter(v => 
      new Date(v.verified_at) >= monthAgo
    ).length;

    setStats({
      totalVerifications: verifications.length,
      todayVerifications: todayCount,
      weeklyVerifications: weeklyCount,
      monthlyVerifications: monthlyCount,
    });
  }, [verifications]);

  // Verify a ticket
  const verifyTicket = useCallback(async (
    ticketCode: string,
    verificationMethod: 'qr_scan' | 'manual' | 'nfc' = 'qr_scan',
    notes?: string
  ) => {
    if (!user?.id) throw new Error('Admin must be authenticated');

    try {
      setIsLoading(true);

      // First, check if the ticket exists and is valid
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          events (
            id,
            title,
            location,
            start_date,
            end_date
          )
        `)
        .eq('ticket_code', ticketCode)
        .single();

      if (bookingError || !booking) {
        throw new Error('Invalid ticket code');
      }

      // Check if ticket is already verified
      if (booking.is_verified) {
        throw new Error('Ticket has already been used');
      }

      // Check if event is currently happening
      const now = new Date();
      const eventStart = new Date(booking.events.start_date);
      const eventEnd = new Date(booking.events.end_date);
      
      if (now < eventStart) {
        throw new Error('Event has not started yet');
      }
      
      if (now > eventEnd) {
        throw new Error('Event has already ended');
      }

      // Mark ticket as verified
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      // Create verification record
      const { data: verification, error: verificationError } = await supabase
        .from('ticket_verifications')
        .insert({
          booking_id: booking.id,
          admin_id: user.id,
          event_id: booking.event_id,
          verified_at: new Date().toISOString(),
          verification_method: verificationMethod,
          notes,
        })
        .select()
        .single();

      if (verificationError) throw verificationError;

      // Refresh verifications
      await fetchVerifications();

      return {
        success: true,
        booking,
        verification,
      };
    } catch (error: any) {
      console.error('Verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchVerifications]);

  // Get verification by ticket code
  const getVerificationByTicket = useCallback(async (ticketCode: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          events (
            id,
            title,
            location
          ),
          ticket_verifications (
            *
          )
        `)
        .eq('ticket_code', ticketCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching verification:', error);
      return null;
    }
  }, []);

  // Export verification data
  const exportVerifications = useCallback(async (
    startDate?: Date,
    endDate?: Date,
    format: 'csv' | 'json' = 'csv'
  ) => {
    try {
      let query = supabase
        .from('ticket_verifications')
        .select(`
          *,
          bookings (
            id,
            ticket_code,
            amount_paid,
            events (
              id,
              title,
              location,
              start_date
            )
          )
        `)
        .eq('admin_id', user?.id);

      if (startDate) {
        query = query.gte('verified_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('verified_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = [
          'Verification Date',
          'Ticket Code',
          'Event Title',
          'Event Location',
          'Amount Paid',
          'Verification Method',
          'Notes'
        ];

        const csvRows = data?.map(v => [
          new Date(v.verified_at).toLocaleString(),
          v.bookings.ticket_code,
          v.bookings.events.title,
          v.bookings.events.location,
          v.bookings.amount_paid,
          v.verification_method,
          v.notes || ''
        ]) || [];

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        return csvContent;
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting verifications:', error);
      throw error;
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchVerifications();
    }
  }, [user?.id, fetchVerifications]);

  useEffect(() => {
    calculateStats();
  }, [verifications, calculateStats]);

  return {
    verifications,
    stats,
    isLoading,
    verifyTicket,
    getVerificationByTicket,
    fetchVerifications,
    exportVerifications,
  };
};
