import { View, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '~/hooks/useAuth';
import { useEventStore } from '~/store/store';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';

export default function Dashboard() {
    const { user } = useAuth();
    const { events, scannedAttendees } = useEventStore();

    const todayScans = scannedAttendees.filter(
        (attendee) =>
            attendee.check_in_time &&
            new Date(attendee.check_in_time).toDateString() === new Date().toDateString()
    ).length;

    return (
        <Container>
            <ScrollView className="flex-1">
                <View className="p-6">
                    <Text className="mb-2 text-2xl font-bold text-gray-800">
                        Welcome back, {user?.user_metadata?.full_name || user?.email}!
                    </Text>
                    <Text className="mb-6 text-gray-600">
                        Here&apos;s what&apos;s happening with your events today.
                    </Text>

                    {/* Stats Cards */}
                    <View className="mb-6 space-y-4">
                        <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <Text className="text-3xl font-bold text-indigo-600">{events.length}</Text>
                            <Text className="text-gray-600">Active Events</Text>
                        </View>

                        <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <Text className="text-3xl font-bold text-green-600">{todayScans}</Text>
                            <Text className="text-gray-600">Check-ins Today</Text>
                        </View>

                        <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <Text className="text-3xl font-bold text-blue-600">{scannedAttendees.length}</Text>
                            <Text className="text-gray-600">Total Scanned</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="space-y-3">
                        <Text className="text-lg font-semibold text-gray-800">Quick Actions</Text>

                        <Link href="/scan" asChild>
                            <Button title="Scan QR Code" className="w-full bg-green-500" />
                        </Link>

                        <Link href="/events" asChild>
                            <Button title="View Events" className="w-full" />
                        </Link>
                    </View>

                    {/* Recent Activity */}
                    {scannedAttendees.length > 0 && (
                        <View className="mt-6">
                            <Text className="mb-3 text-lg font-semibold text-gray-800">Recent Check-ins</Text>
                            <View className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                {scannedAttendees
                                    .slice(-5)
                                    .reverse()
                                    .map((attendee) => (
                                        <View
                                            key={attendee.id}
                                            className="border-b border-gray-100 p-4 last:border-b-0">
                                            <Text className="font-medium text-gray-800">{attendee.name}</Text>
                                            <Text className="text-sm text-gray-600">{attendee.email}</Text>
                                            <Text className="text-xs text-gray-400">
                                                {attendee.check_in_time &&
                                                    new Date(attendee.check_in_time).toLocaleString()}
                                            </Text>
                                        </View>
                                    ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </Container>
    );
}
