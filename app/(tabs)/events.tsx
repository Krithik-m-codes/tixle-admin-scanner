import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../../src/hooks/useEvents';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Events() {
    const { events, isLoading } = useEvents();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

    const filteredEvents = () => {
        let filtered = events;

        // Apply date filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (selectedFilter) {
            case 'today':
                filtered = events.filter(event => {
                    const eventDate = new Date(event.start_date);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate.getTime() === today.getTime();
                });
                break;
            case 'upcoming':
                filtered = events.filter(event => new Date(event.start_date) > new Date());
                break;
            case 'past':
                filtered = events.filter(event => new Date(event.end_date) < new Date());
                break;
            default:
                filtered = events;
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    };

    const getEventStatus = (event: any) => {
        const now = new Date();
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        if (now < startDate) return { status: 'upcoming', color: '#3B82F6', text: 'Upcoming' };
        if (now >= startDate && now <= endDate) return { status: 'live', color: '#10B981', text: 'Live' };
        return { status: 'ended', color: '#6B7280', text: 'Ended' };
    };

    const handleEventAction = (event: any, action: string) => {
        switch (action) {
            case 'view_details':
                router.push(`/event-detail?id=${event.id}`);
                break;
            case 'view_attendees':
                Alert.alert('Feature Coming Soon', 'Attendee management will be available soon.');
                break;
            case 'send_notification':
                Alert.alert(
                    'Send Notification',
                    `Send notification to all attendees of "${event.title}"?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Send', onPress: () => { } },
                    ]
                );
                break;
            case 'emergency_alert':
                Alert.alert(
                    'Emergency Alert',
                    `Send emergency alert for "${event.title}"?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Send Alert', style: 'destructive', onPress: () => { } },
                    ]
                );
                break;
        }
    };

    const filters = [
        { key: 'all', label: 'All Events' },
        { key: 'today', label: 'Today' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'past', label: 'Past' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-gray-900">Event Management</Text>
                        <Text className="text-lg text-gray-600">Manage your theater events</Text>
                    </View>

                    {/* Search Bar */}
                    <View className="mb-4">
                        <View className="flex-row items-center rounded-lg border border-gray-200 bg-white px-4 py-3">
                            <Ionicons name="search" size={20} color="#6B7280" />
                            <TextInput
                                className="ml-3 flex-1 text-gray-900"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Filter Tabs */}
                    <View className="mb-6">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row space-x-2">
                                {filters.map((filter) => (
                                    <TouchableOpacity
                                        key={filter.key}
                                        onPress={() => setSelectedFilter(filter.key as any)}
                                        className={`rounded-full px-6 py-2 ${selectedFilter === filter.key
                                                ? 'bg-indigo-600'
                                                : 'bg-white border border-gray-200'
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium ${selectedFilter === filter.key ? 'text-white' : 'text-gray-700'
                                                }`}
                                        >
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Events List */}
                    {filteredEvents().length === 0 ? (
                        <View className="items-center rounded-lg bg-white p-8">
                            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                            <Text className="mt-4 text-center text-lg font-medium text-gray-900">
                                No events found
                            </Text>
                            <Text className="mt-2 text-center text-gray-500">
                                {searchQuery ? 'Try adjusting your search' : 'No events match the current filter'}
                            </Text>
                        </View>
                    ) : (
                        <View className="space-y-4">
                            {filteredEvents().map((event) => {
                                const eventStatus = getEventStatus(event);
                                return (
                                    <View key={event.id} className="rounded-lg bg-white p-4 shadow-sm">
                                        {/* Event Header */}
                                        <View className="mb-3 flex-row items-start justify-between">
                                            <View className="flex-1">
                                                <Text className="text-lg font-bold text-gray-900">{event.title}</Text>
                                                <View className="mt-1 flex-row items-center">
                                                    <Ionicons name="location" size={16} color="#6B7280" />
                                                    <Text className="ml-1 text-sm text-gray-600">{event.location}</Text>
                                                </View>
                                            </View>
                                            <View
                                                className="rounded-full px-3 py-1"
                                                style={{ backgroundColor: eventStatus.color + '20' }}
                                            >
                                                <Text className="text-xs font-medium" style={{ color: eventStatus.color }}>
                                                    {eventStatus.text}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Event Details */}
                                        <View className="mb-4 space-y-2">
                                            <View className="flex-row items-center">
                                                <Ionicons name="calendar" size={16} color="#6B7280" />
                                                <Text className="ml-2 text-sm text-gray-600">
                                                    {new Date(event.start_date).toLocaleDateString()} at{' '}
                                                    {new Date(event.start_date).toLocaleTimeString()}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="people" size={16} color="#6B7280" />
                                                <Text className="ml-2 text-sm text-gray-600">
                                                    {event.current_attendees}/{event.max_attendees} attendees
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="cash" size={16} color="#6B7280" />
                                                <Text className="ml-2 text-sm text-gray-600">₹{event.price}</Text>
                                            </View>
                                        </View>

                                        {/* Attendance Progress */}
                                        <View className="mb-4">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <Text className="text-xs text-gray-500">Attendance</Text>
                                                <Text className="text-xs text-gray-500">
                                                    {Math.round((event.current_attendees / event.max_attendees) * 100)}%
                                                </Text>
                                            </View>
                                            <View className="h-2 rounded-full bg-gray-200">
                                                <View
                                                    className="h-2 rounded-full bg-indigo-600"
                                                    style={{
                                                        width: `${(event.current_attendees / event.max_attendees) * 100}%`,
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        <View className="flex-row flex-wrap gap-2">
                                            <TouchableOpacity
                                                onPress={() => handleEventAction(event, 'view_details')}
                                                className="flex-1 min-w-[45%] flex-row items-center justify-center rounded-lg bg-indigo-50 px-3 py-2"
                                            >
                                                <Ionicons name="eye" size={16} color="#4F46E5" />
                                                <Text className="ml-1 text-sm font-medium text-indigo-700">Details</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleEventAction(event, 'view_attendees')}
                                                className="flex-1 min-w-[45%] flex-row items-center justify-center rounded-lg bg-green-50 px-3 py-2"
                                            >
                                                <Ionicons name="people" size={16} color="#059669" />
                                                <Text className="ml-1 text-sm font-medium text-green-700">Attendees</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleEventAction(event, 'send_notification')}
                                                className="flex-1 min-w-[45%] flex-row items-center justify-center rounded-lg bg-blue-50 px-3 py-2"
                                            >
                                                <Ionicons name="notifications" size={16} color="#2563EB" />
                                                <Text className="ml-1 text-sm font-medium text-blue-700">Notify</Text>
                                            </TouchableOpacity>

                                            {eventStatus.status === 'live' && (
                                                <TouchableOpacity
                                                    onPress={() => handleEventAction(event, 'emergency_alert')}
                                                    className="flex-1 min-w-[45%] flex-row items-center justify-center rounded-lg bg-red-50 px-3 py-2"
                                                >
                                                    <Ionicons name="warning" size={16} color="#DC2626" />
                                                    <Text className="ml-1 text-sm font-medium text-red-700">Emergency</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
