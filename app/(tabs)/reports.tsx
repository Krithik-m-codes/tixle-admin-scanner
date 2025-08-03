import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../../src/hooks/useEvents';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/lib/supabase';

interface ReportData {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    verifiedToday: number;
    upcomingEvents: number;
    liveEvents: number;
    totalAttendees: number;
    avgAttendanceRate: number;
}

export default function Reports() {
    const { events } = useEvents();
    const { user } = useAuth();
    const [reportData, setReportData] = useState<ReportData>({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        verifiedToday: 0,
        upcomingEvents: 0,
        liveEvents: 0,
        totalAttendees: 0,
        avgAttendanceRate: 0,
    });
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, [selectedPeriod, events]);

    const fetchReportData = async () => {
        setIsLoading(true);

        try {
            // Calculate date range
            const now = new Date();
            let startDate: Date;

            switch (selectedPeriod) {
                case 'today':
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                default:
                    startDate = new Date('2020-01-01');
            }

            // Fetch bookings data
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('*')
                .gte('created_at', startDate.toISOString());

            if (bookingsError) throw bookingsError;

            // Fetch verification data for today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const { data: verifications, error: verificationsError } = await supabase
                .from('ticket_verifications')
                .select('*')
                .gte('verified_at', todayStart.toISOString());

            if (verificationsError) throw verificationsError;

            // Calculate metrics
            const totalTicketsSold = bookings?.length || 0;
            const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.amount_paid, 0) || 0;
            const verifiedToday = verifications?.length || 0;

            // Filter events by period
            const filteredEvents = events.filter(event => {
                const eventDate = new Date(event.created_at);
                return eventDate >= startDate;
            });

            const upcomingEvents = events.filter(event => new Date(event.start_date) > now).length;
            const liveEvents = events.filter(event => {
                const start = new Date(event.start_date);
                const end = new Date(event.end_date);
                return now >= start && now <= end;
            }).length;

            const totalAttendees = events.reduce((sum, event) => sum + event.current_attendees, 0);
            const avgAttendanceRate = events.length > 0
                ? events.reduce((sum, event) => sum + (event.current_attendees / event.max_attendees), 0) / events.length * 100
                : 0;

            setReportData({
                totalEvents: filteredEvents.length,
                totalTicketsSold,
                totalRevenue,
                verifiedToday,
                upcomingEvents,
                liveEvents,
                totalAttendees,
                avgAttendanceRate,
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const periods = [
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'all', label: 'All Time' },
    ];

    const metrics = [
        {
            title: 'Total Events',
            value: reportData.totalEvents.toString(),
            icon: 'calendar' as const,
            color: '#3B82F6',
            subtitle: selectedPeriod === 'today' ? 'Today' : `This ${selectedPeriod}`,
        },
        {
            title: 'Tickets Sold',
            value: reportData.totalTicketsSold.toString(),
            icon: 'ticket' as const,
            color: '#10B981',
            subtitle: selectedPeriod === 'today' ? 'Today' : `This ${selectedPeriod}`,
        },
        {
            title: 'Revenue',
            value: `₹${reportData.totalRevenue.toLocaleString()}`,
            icon: 'cash' as const,
            color: '#F59E0B',
            subtitle: selectedPeriod === 'today' ? 'Today' : `This ${selectedPeriod}`,
        },
        {
            title: 'Verified Today',
            value: reportData.verifiedToday.toString(),
            icon: 'checkmark-circle' as const,
            color: '#8B5CF6',
            subtitle: 'Tickets scanned',
        },
        {
            title: 'Live Events',
            value: reportData.liveEvents.toString(),
            icon: 'radio' as const,
            color: '#EF4444',
            subtitle: 'Currently active',
        },
        {
            title: 'Upcoming Events',
            value: reportData.upcomingEvents.toString(),
            icon: 'time' as const,
            color: '#06B6D4',
            subtitle: 'Scheduled ahead',
        },
        {
            title: 'Total Attendees',
            value: reportData.totalAttendees.toString(),
            icon: 'people' as const,
            color: '#84CC16',
            subtitle: 'All events',
        },
        {
            title: 'Avg. Attendance',
            value: `${reportData.avgAttendanceRate.toFixed(1)}%`,
            icon: 'trending-up' as const,
            color: '#F97316',
            subtitle: 'Capacity utilization',
        },
    ];

    const quickReports = [
        {
            title: 'Daily Verification Report',
            description: 'View today\'s ticket verification activity',
            icon: 'document-text' as const,
            onPress: () => { },
        },
        {
            title: 'Event Performance',
            description: 'Analyze event attendance and revenue',
            icon: 'bar-chart' as const,
            onPress: () => { },
        },
        {
            title: 'Financial Summary',
            description: 'Revenue breakdown and trends',
            icon: 'pie-chart' as const,
            onPress: () => { },
        },
        {
            title: 'Export Data',
            description: 'Download reports as CSV or PDF',
            icon: 'download' as const,
            onPress: () => { },
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-gray-900">Reports & Analytics</Text>
                        <Text className="text-lg text-gray-600">Track performance and insights</Text>
                    </View>

                    {/* Period Selector */}
                    <View className="mb-6">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row space-x-2">
                                {periods.map((period) => (
                                    <TouchableOpacity
                                        key={period.key}
                                        onPress={() => setSelectedPeriod(period.key as any)}
                                        className={`rounded-full px-6 py-2 ${selectedPeriod === period.key
                                                ? 'bg-indigo-600'
                                                : 'bg-white border border-gray-200'
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium ${selectedPeriod === period.key ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            {period.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Metrics Grid */}
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Key Metrics</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {metrics.map((metric, index) => (
                                <View
                                    key={index}
                                    className="mb-4 w-[48%] rounded-lg bg-white p-4 shadow-sm"
                                >
                                    <View className="mb-2 flex-row items-center">
                                        <View
                                            className="mr-2 h-8 w-8 items-center justify-center rounded-full"
                                            style={{ backgroundColor: metric.color + '20' }}
                                        >
                                            <Ionicons name={metric.icon} size={16} color={metric.color} />
                                        </View>
                                        <Text className="text-xs font-medium text-gray-500">{metric.title}</Text>
                                    </View>
                                    <Text className="text-2xl font-bold text-gray-900">{metric.value}</Text>
                                    <Text className="text-xs text-gray-500">{metric.subtitle}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Quick Reports */}
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Quick Reports</Text>
                        <View className="space-y-3">
                            {quickReports.map((report, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={report.onPress}
                                    className="flex-row items-center rounded-lg bg-white p-4 shadow-sm"
                                >
                                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                                        <Ionicons name={report.icon} size={24} color="#4F46E5" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900">{report.title}</Text>
                                        <Text className="text-sm text-gray-600">{report.description}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Performance Chart Placeholder */}
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Performance Overview</Text>
                        <View className="rounded-lg bg-white p-6 shadow-sm">
                            <View className="items-center">
                                <Ionicons name="bar-chart" size={64} color="#D1D5DB" />
                                <Text className="mt-4 text-center font-medium text-gray-900">
                                    Chart Coming Soon
                                </Text>
                                <Text className="mt-2 text-center text-sm text-gray-500">
                                    Interactive charts and graphs will be available in the next update
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <View className="mb-8">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Recent Activity</Text>
                        <View className="rounded-lg bg-white shadow-sm">
                            {[
                                { time: '2 minutes ago', activity: 'Ticket verified for "Romeo & Juliet"', type: 'verification' },
                                { time: '15 minutes ago', activity: 'New booking received', type: 'booking' },
                                { time: '1 hour ago', activity: 'Event "Hamlet" started', type: 'event' },
                                { time: '2 hours ago', activity: 'Emergency alert sent', type: 'alert' },
                            ].map((item, index) => (
                                <View
                                    key={index}
                                    className={`flex-row items-center p-4 ${index !== 3 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <View
                                        className={`mr-3 h-2 w-2 rounded-full ${item.type === 'verification'
                                                ? 'bg-green-400'
                                                : item.type === 'booking'
                                                    ? 'bg-blue-400'
                                                    : item.type === 'event'
                                                        ? 'bg-purple-400'
                                                        : 'bg-red-400'
                                            }`}
                                    />
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-900">{item.activity}</Text>
                                        <Text className="text-xs text-gray-500">{item.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
