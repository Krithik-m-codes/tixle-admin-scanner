import React from 'react';
import { router } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { useEvents } from '../../src/hooks/useEvents';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';

export default function Profile() {
    const { user, session, signOut } = useAuth();
    const { events } = useEvents();

    const adminStats = [
        { label: 'Total Events', value: events.length, icon: 'calendar' as const },
        { label: 'Active Events', value: events.filter(e => new Date(e.start_date) > new Date()).length, icon: 'time' as const },
        {
            label: 'Events Today', value: events.filter(e => {
                const today = new Date().toDateString();
                return new Date(e.start_date).toDateString() === today;
            }).length, icon: 'today' as const
        },
    ];

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    router.replace('/login' as any);
                },
            },
        ]);
    };

    if (!session || !user) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="person-circle" size={64} color="#d1d5db" />
                    <Text className="mt-4 text-center text-xl font-bold text-gray-900">Not Signed In</Text>
                    <Text className="mb-6 mt-2 text-center text-gray-500">
                        Please sign in to access admin features
                    </Text>
                    <Button title="Sign In" onPress={() => router.push('/login' as any)} variant="primary" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Profile Header */}
                    <View className="mb-6 items-center rounded-lg bg-white p-6">
                        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                            <Ionicons name="person" size={32} color="#6366f1" />
                        </View>
                        <Text className="mb-1 text-xl font-bold text-gray-900">
                            {user.user_metadata?.name || 'Admin User'}
                        </Text>
                        <Text className="text-gray-500">{user.email}</Text>
                        <View className="mt-2 rounded-full bg-indigo-50 px-3 py-1">
                            <Text className="text-sm font-medium text-indigo-700">Theater Administrator</Text>
                        </View>
                    </View>

                    {/* Admin Stats */}
                    <View className="mb-6 rounded-lg bg-white p-6">
                        <Text className="mb-4 text-lg font-bold text-gray-900">Your Statistics</Text>
                        <View className="space-y-4">
                            {adminStats.map((stat, index) => (
                                <View key={index} className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                                            <Ionicons name={stat.icon} size={20} color="#6366f1" />
                                        </View>
                                        <Text className="text-gray-700">{stat.label}</Text>
                                    </View>
                                    <Text className="text-xl font-bold text-indigo-600">{stat.value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Admin Actions */}
                    <View className="mb-6 rounded-lg bg-white">
                        <View className="border-b border-gray-100 p-6">
                            <Text className="text-lg font-bold text-gray-900">Admin Actions</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/scanner' as any)}
                            className="flex-row items-center justify-between border-b border-gray-100 p-4"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="scan" size={20} color="#6366f1" />
                                <Text className="ml-3 text-gray-700">Ticket Scanner</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/events' as any)}
                            className="flex-row items-center justify-between border-b border-gray-100 p-4"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="calendar" size={20} color="#6366f1" />
                                <Text className="ml-3 text-gray-700">Manage Events</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/reports' as any)}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="analytics" size={20} color="#6366f1" />
                                <Text className="ml-3 text-gray-700">View Reports</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* System Settings */}
                    <View className="mb-6 rounded-lg bg-white">
                        <View className="border-b border-gray-100 p-6">
                            <Text className="text-lg font-bold text-gray-900">Settings</Text>
                        </View>

                        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-100 p-4">
                            <View className="flex-row items-center">
                                <Ionicons name="notifications" size={20} color="#6366f1" />
                                <Text className="ml-3 text-gray-700">Notification Preferences</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-100 p-4">
                            <View className="flex-row items-center">
                                <Ionicons name="shield-checkmark" size={20} color="#6366f1" />
                                <Text className="ml-3 text-gray-700">Security Settings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center">
                                <Ionicons name="help-circle" size={20} color="#6366f1" />
                                <Text className="ml-3 text-gray-700">Help & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* App Info */}
                    <View className="mb-6 rounded-lg bg-white p-6">
                        <Text className="mb-4 text-lg font-bold text-gray-900">App Information</Text>
                        <View className="space-y-2">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Version</Text>
                                <Text className="text-gray-900">1.0.0</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Build</Text>
                                <Text className="text-gray-900">Admin Beta</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Last Updated</Text>
                                <Text className="text-gray-900">Today</Text>
                            </View>
                        </View>
                    </View>

                    {/* Emergency Actions */}
                    <View className="mb-6 rounded-lg bg-red-50 border border-red-200 p-6">
                        <Text className="mb-4 text-lg font-bold text-red-900">Emergency Actions</Text>
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    'Emergency Alert',
                                    'Send emergency notification to all active event attendees?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Send Alert', style: 'destructive', onPress: () => { } },
                                    ]
                                );
                            }}
                            className="flex-row items-center rounded-lg bg-red-100 p-4"
                        >
                            <Ionicons name="warning" size={20} color="#DC2626" />
                            <Text className="ml-3 font-medium text-red-700">Send Emergency Alert</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Out Button */}
                    <View className="mb-8">
                        <Button
                            title="Sign Out"
                            onPress={handleLogout}
                            variant="outline"
                            fullWidth
                            icon="log-out"
                            className="border-red-300 bg-red-50"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
