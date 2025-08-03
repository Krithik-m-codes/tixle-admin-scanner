import React from 'react';
import { router } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { useEvents } from '../../src/hooks/useEvents';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const { events, isLoading } = useEvents();

    const todaysEvents = events.filter(event => {
        const today = new Date().toDateString();
        const eventDate = new Date(event.start_date).toDateString();
        return today === eventDate;
    });

    const quickActions = [
        {
            title: 'Scan Tickets',
            description: 'Verify ticket authenticity',
            icon: 'scan' as const,
            color: '#10B981',
            onPress: () => router.push('/scanner'),
        },
        {
            title: 'Event Management',
            description: 'Manage current events',
            icon: 'calendar' as const,
            color: '#3B82F6',
            onPress: () => router.push('/events'),
        },
        {
            title: 'View Reports',
            description: 'Analytics and insights',
            icon: 'analytics' as const,
            color: '#8B5CF6',
            onPress: () => router.push('/reports'),
        },
        {
            title: 'Emergency Alert',
            description: 'Send urgent notifications',
            icon: 'warning' as const,
            color: '#EF4444',
            onPress: () => {
                Alert.alert(
                    'Emergency Alert',
                    'Are you sure you want to send an emergency notification to all attendees?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Send Alert', style: 'destructive', onPress: () => { } },
                    ]
                );
            },
        },
    ];

    const stats = [
        { label: 'Today\'s Events', value: todaysEvents.length, color: '#10B981' },
        { label: 'Total Events', value: events.length, color: '#3B82F6' },
        { label: 'Active Sessions', value: '3', color: '#8B5CF6' },
        { label: 'Verified Today', value: '247', color: '#F59E0B' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Header */}
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-gray-900">Admin Dashboard</Text>
                        <Text className="text-lg text-gray-600">
                            Welcome back, {user?.user_metadata?.name || 'Admin'}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Theater Management System
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Today&apos;s Overview</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {stats.map((stat, index) => (
                                <View
                                    key={index}
                                    className="mb-4 w-[48%] rounded-lg bg-white p-4 shadow-sm"
                                >
                                    <Text className="text-2xl font-bold" style={{ color: stat.color }}>
                                        {stat.value}
                                    </Text>
                                    <Text className="text-sm text-gray-600">{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Quick Actions</Text>
                        <View className="space-y-3">
                            {quickActions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={action.onPress}
                                    className="flex-row items-center rounded-lg bg-white p-4 shadow-sm"
                                >
                                    <View
                                        className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                                        style={{ backgroundColor: action.color + '20' }}
                                    >
                                        <Ionicons name={action.icon} size={24} color={action.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900">{action.title}</Text>
                                        <Text className="text-sm text-gray-600">{action.description}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Today's Events */}
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-bold text-gray-900">Today&apos;s Events</Text>
                        {todaysEvents.length === 0 ? (
                            <View className="items-center rounded-lg bg-white p-8">
                                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                                <Text className="mt-2 text-center text-gray-500">No events scheduled for today</Text>
                            </View>
                        ) : (
                            <View className="space-y-3">
                                {todaysEvents.map((event) => (
                                    <TouchableOpacity
                                        key={event.id}
                                        className="rounded-lg bg-white p-4 shadow-sm"
                                        onPress={() => router.push(`/event-detail?id=${event.id}`)}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1">
                                                <Text className="font-semibold text-gray-900">{event.title}</Text>
                                                <Text className="text-sm text-gray-600">{event.location}</Text>
                                                <Text className="text-sm text-gray-500">
                                                    {new Date(event.start_date).toLocaleTimeString()}
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-sm font-medium text-indigo-600">
                                                    {event.current_attendees}/{event.max_attendees}
                                                </Text>
                                                <Text className="text-xs text-gray-500">attendees</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* System Status */}
                    <View className="mb-8">
                        <Text className="mb-4 text-xl font-bold text-gray-900">System Status</Text>
                        <View className="rounded-lg bg-white p-4 shadow-sm">
                            <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
                                <Text className="text-gray-700">Scanner Service</Text>
                                <View className="flex-row items-center">
                                    <View className="mr-2 h-2 w-2 rounded-full bg-green-400"></View>
                                    <Text className="text-sm text-green-600">Online</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center justify-between border-b border-gray-100 py-3">
                                <Text className="text-gray-700">Payment Gateway</Text>
                                <View className="flex-row items-center">
                                    <View className="mr-2 h-2 w-2 rounded-full bg-green-400"></View>
                                    <Text className="text-sm text-green-600">Connected</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center justify-between pt-3">
                                <Text className="text-gray-700">Database</Text>
                                <View className="flex-row items-center">
                                    <View className="mr-2 h-2 w-2 rounded-full bg-green-400"></View>
                                    <Text className="text-sm text-green-600">Healthy</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
