import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../src/hooks/useEvents';
import { supabase } from '../src/lib/supabase';

interface TicketStats {
    total: number;
    sold: number;
    verified: number;
    remaining: number;
}

export default function EventDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { events } = useEvents();
    const [ticketStats, setTicketStats] = useState<TicketStats>({
        total: 0,
        sold: 0,
        verified: 0,
        remaining: 0,
    });
    const [loading, setLoading] = useState(true);

    const event = events.find(e => e.id === id);

    const fetchTicketStats = useCallback(async () => {
        if (!event) return;

        try {
            setLoading(true);

            // Get total bookings for this event
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('*')
                .eq('event_id', event.id);

            if (bookingsError) throw bookingsError;

            // Get verified tickets for this event
            const { data: verifications, error: verificationsError } = await supabase
                .from('ticket_verifications')
                .select('*')
                .eq('event_id', event.id);

            if (verificationsError) throw verificationsError;

            const total = event.max_attendees || 0;
            const sold = bookings?.length || 0;
            const verified = verifications?.length || 0;
            const remaining = total - sold;

            setTicketStats({
                total,
                sold,
                verified,
                remaining,
            });
        } catch (error) {
            console.error('Error fetching ticket stats:', error);
            Alert.alert('Error', 'Failed to load ticket statistics');
        } finally {
            setLoading(false);
        }
    }, [event]);

    useEffect(() => {
        if (event) {
            fetchTicketStats();
        }
    }, [event, fetchTicketStats]);

    if (!event) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">Event not found</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2"
                    >
                        <Text className="text-white font-medium">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#4F46E5" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">Event Details</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Event Info */}
                <View className="bg-white m-4 rounded-xl p-4 shadow-sm">
                    <Text className="text-xl font-bold text-gray-900 mb-2">{event.title}</Text>
                    <Text className="text-gray-600 mb-4">{event.description}</Text>

                    <View className="space-y-2">
                        <View className="flex-row items-center">
                            <Ionicons name="location" size={16} color="#6B7280" />
                            <Text className="ml-2 text-gray-600">{event.location}</Text>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={16} color="#6B7280" />
                            <Text className="ml-2 text-gray-600">
                                {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="cash" size={16} color="#6B7280" />
                            <Text className="ml-2 text-gray-600">${event.price}</Text>
                        </View>
                    </View>
                </View>

                {/* Ticket Statistics */}
                <View className="bg-white m-4 rounded-xl p-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Ticket Statistics</Text>

                    {loading ? (
                        <Text className="text-gray-500">Loading statistics...</Text>
                    ) : (
                        <View className="grid grid-cols-2 gap-4">
                            <View className="bg-blue-50 p-3 rounded-lg">
                                <Text className="text-2xl font-bold text-blue-600">{ticketStats.total}</Text>
                                <Text className="text-blue-600 text-sm">Total Capacity</Text>
                            </View>

                            <View className="bg-green-50 p-3 rounded-lg">
                                <Text className="text-2xl font-bold text-green-600">{ticketStats.sold}</Text>
                                <Text className="text-green-600 text-sm">Tickets Sold</Text>
                            </View>

                            <View className="bg-purple-50 p-3 rounded-lg">
                                <Text className="text-2xl font-bold text-purple-600">{ticketStats.verified}</Text>
                                <Text className="text-purple-600 text-sm">Verified</Text>
                            </View>

                            <View className="bg-orange-50 p-3 rounded-lg">
                                <Text className="text-2xl font-bold text-orange-600">{ticketStats.remaining}</Text>
                                <Text className="text-orange-600 text-sm">Remaining</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View className="bg-white m-4 rounded-xl p-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>

                    <TouchableOpacity
                        className="bg-indigo-600 rounded-lg p-3 mb-3"
                        onPress={() => router.push('/(tabs)/scanner')}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="qr-code" size={20} color="white" />
                            <Text className="text-white font-medium ml-2">Scan Tickets</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-100 rounded-lg p-3"
                        onPress={fetchTicketStats}
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="refresh" size={20} color="#6B7280" />
                            <Text className="text-gray-700 font-medium ml-2">Refresh Stats</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
