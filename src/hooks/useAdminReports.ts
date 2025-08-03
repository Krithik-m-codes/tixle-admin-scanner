import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useEventsStore } from '../store/events';
import { useAuthStore } from '../store/auth';

interface AdminReportData {
  // Event metrics
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  liveEvents: number;

  // Ticket metrics
  totalTicketsSold: number;
  totalRevenue: number;
  verifiedTickets: number;
  pendingTickets: number;

  // Daily metrics
  dailyVerifications: number;
  dailyRevenue: number;
  dailyTicketsSold: number;

  // Attendance metrics
  totalAttendees: number;
  averageAttendanceRate: number;
  
  // Time period
  periodLabel: string;
}

interface EventPerformance {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  totalTickets: number;
  soldTickets: number;
  verifiedTickets: number;
  revenue: number;
  attendanceRate: number;
}

interface VerificationActivity {
  date: string;
  count: number;
  revenue: number;
}

export const useAdminReports = () => {
  const { events } = useEventsStore();
  const { user } = useAuthStore();
  const [reportData, setReportData] = useState<AdminReportData>({
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    liveEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    verifiedTickets: 0,
    pendingTickets: 0,
    dailyVerifications: 0,
    dailyRevenue: 0,
    dailyTicketsSold: 0,
    totalAttendees: 0,
    averageAttendanceRate: 0,
    periodLabel: 'Today',
  });
  
  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>([]);
  const [verificationActivity, setVerificationActivity] = useState<VerificationActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate report for a specific time period
  const generateReport = useCallback(async (
    period: 'today' | 'week' | 'month' | 'year' | 'all' = 'today'
  ) => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let periodLabel: string;

      switch (period) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          periodLabel = 'Today';
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          periodLabel = 'This Week';
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          periodLabel = 'This Month';
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          periodLabel = 'This Year';
          break;
        default:
          startDate = new Date('2020-01-01');
          periodLabel = 'All Time';
      }

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          events (
            id,
            title,
            location,
            start_date,
            end_date,
            max_attendees
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (bookingsError) throw bookingsError;

      // Fetch verification data
      const { data: verifications, error: verificationsError } = await supabase
        .from('ticket_verifications')
        .select('*')
        .gte('verified_at', startDate.toISOString());

      if (verificationsError) throw verificationsError;

      // Calculate event metrics
      const now_time = new Date();
      const filteredEvents = events.filter(event => 
        new Date(event.created_at) >= startDate
      );

      const totalEvents = filteredEvents.length;
      const upcomingEvents = events.filter(event => 
        new Date(event.start_date) > now_time
      ).length;
      const pastEvents = events.filter(event => 
        new Date(event.end_date) < now_time
      ).length;
      const liveEvents = events.filter(event => {
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);
        return now_time >= start && now_time <= end;
      }).length;
      const activeEvents = upcomingEvents + liveEvents;

      // Calculate ticket metrics
      const totalTicketsSold = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.amount_paid, 0) || 0;
      const verifiedTickets = bookings?.filter(booking => booking.is_verified).length || 0;
      const pendingTickets = totalTicketsSold - verifiedTickets;

      // Calculate daily metrics (for today only)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const dailyBookings = bookings?.filter(booking => 
        new Date(booking.created_at) >= todayStart
      ) || [];
      const dailyVerifications = verifications?.filter(verification => 
        new Date(verification.verified_at) >= todayStart
      ).length || 0;
      const dailyTicketsSold = dailyBookings.length;
      const dailyRevenue = dailyBookings.reduce((sum, booking) => sum + booking.amount_paid, 0);

      // Calculate attendance metrics
      const totalAttendees = events.reduce((sum, event) => sum + event.current_attendees, 0);
      const averageAttendanceRate = events.length > 0 
        ? (events.reduce((sum, event) => sum + (event.current_attendees / event.max_attendees), 0) / events.length) * 100
        : 0;

      setReportData({
        totalEvents,
        activeEvents,
        upcomingEvents,
        pastEvents,
        liveEvents,
        totalTicketsSold,
        totalRevenue,
        verifiedTickets,
        pendingTickets,
        dailyVerifications,
        dailyRevenue,
        dailyTicketsSold,
        totalAttendees,
        averageAttendanceRate,
        periodLabel,
      });

      // Generate event performance data
      const eventPerformanceData: EventPerformance[] = events.map(event => {
        const eventBookings = bookings?.filter(booking => booking.event_id === event.id) || [];
        const eventVerifications = eventBookings.filter(booking => booking.is_verified);
        const revenue = eventBookings.reduce((sum, booking) => sum + booking.amount_paid, 0);
        
        return {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.start_date,
          eventLocation: event.location,
          totalTickets: event.max_attendees,
          soldTickets: eventBookings.length,
          verifiedTickets: eventVerifications.length,
          revenue,
          attendanceRate: (eventBookings.length / event.max_attendees) * 100,
        };
      });

      setEventPerformance(eventPerformanceData);

      // Generate verification activity (last 7 days)
      const activityData: VerificationActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const dayVerifications = verifications?.filter(v => {
          const vDate = new Date(v.verified_at);
          return vDate >= date && vDate < nextDate;
        }) || [];
        
        const dayBookings = bookings?.filter(b => {
          const bDate = new Date(b.created_at);
          return bDate >= date && bDate < nextDate && b.is_verified;
        }) || [];
        
        const dayRevenue = dayBookings.reduce((sum, booking) => sum + booking.amount_paid, 0);
        
        activityData.push({
          date: date.toISOString().split('T')[0],
          count: dayVerifications.length,
          revenue: dayRevenue,
        });
      }
      
      setVerificationActivity(activityData);

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  }, [events]);

  // Export report data
  const exportReport = useCallback(async (
    format: 'csv' | 'json' = 'csv',
    includeDetails: boolean = false
  ) => {
    try {
      if (format === 'csv') {
        const headers = [
          'Metric',
          'Value',
          'Period'
        ];

        const rows = [
          ['Total Events', reportData.totalEvents.toString(), reportData.periodLabel],
          ['Active Events', reportData.activeEvents.toString(), reportData.periodLabel],
          ['Upcoming Events', reportData.upcomingEvents.toString(), reportData.periodLabel],
          ['Past Events', reportData.pastEvents.toString(), reportData.periodLabel],
          ['Live Events', reportData.liveEvents.toString(), reportData.periodLabel],
          ['Total Tickets Sold', reportData.totalTicketsSold.toString(), reportData.periodLabel],
          ['Total Revenue', `₹${reportData.totalRevenue}`, reportData.periodLabel],
          ['Verified Tickets', reportData.verifiedTickets.toString(), reportData.periodLabel],
          ['Pending Tickets', reportData.pendingTickets.toString(), reportData.periodLabel],
          ['Average Attendance Rate', `${reportData.averageAttendanceRate.toFixed(1)}%`, reportData.periodLabel],
        ];

        let csvContent = [headers, ...rows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        if (includeDetails) {
          csvContent += '\n\nEvent Performance\n';
          csvContent += '"Event Title","Date","Location","Total Tickets","Sold Tickets","Verified Tickets","Revenue","Attendance Rate"\n';
          
          eventPerformance.forEach(event => {
            csvContent += `"${event.eventTitle}","${new Date(event.eventDate).toLocaleDateString()}","${event.eventLocation}","${event.totalTickets}","${event.soldTickets}","${event.verifiedTickets}","₹${event.revenue}","${event.attendanceRate.toFixed(1)}%"\n`;
          });
        }

        return csvContent;
      }

      return JSON.stringify({
        summary: reportData,
        eventPerformance: includeDetails ? eventPerformance : undefined,
        verificationActivity: includeDetails ? verificationActivity : undefined,
        generatedAt: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }, [reportData, eventPerformance, verificationActivity]);

  // Get top performing events
  const getTopPerformingEvents = useCallback((limit: number = 5) => {
    return eventPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }, [eventPerformance]);

  // Get events with low attendance
  const getLowAttendanceEvents = useCallback((threshold: number = 50) => {
    return eventPerformance
      .filter(event => event.attendanceRate < threshold)
      .sort((a, b) => a.attendanceRate - b.attendanceRate);
  }, [eventPerformance]);

  useEffect(() => {
    generateReport('today');
  }, [generateReport]);

  return {
    reportData,
    eventPerformance,
    verificationActivity,
    isLoading,
    generateReport,
    exportReport,
    getTopPerformingEvents,
    getLowAttendanceEvents,
  };
};
