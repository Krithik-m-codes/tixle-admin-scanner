import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function EventDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // Mock event data - in a real app, this would come from your database
    const event = {
        id,
        name: 'Tech Conference 2025',
        date: '2025-02-15',
        location: 'Convention Center',
        description:
            'Annual technology conference with industry leaders from around the world. Join us for three days of innovative presentations, networking opportunities, and hands-on workshops.',
        attendees: [
            { id: '1', name: 'John Doe', email: 'john@example.com', checked_in: true },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', checked_in: false },
            { id: '3', name: 'Mike Johnson', email: 'mike@example.com', checked_in: true },
            { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', checked_in: false },
        ],
    };

    const checkedInCount = event.attendees.filter((a) => a.checked_in).length;
    const totalAttendees = event.attendees.length;

    return (
        <>
            <Stack.Screen
                options={{
                    title: event.name,
                    headerShown: true,
                }}
            />
            <Container>
                <ScrollView className="flex-1">
                    <View className="p-6">
                        {/* Event Header */}
                        <View className="mb-6">
                            <Text className="mb-2 text-2xl font-bold text-gray-800">{event.name}</Text>

                            <View className="mb-2 flex-row items-center">
                                <FontAwesome name="calendar" size={16} color="#6b7280" />
                                <Text className="ml-2 text-gray-600">
                                    {new Date(event.date).toLocaleDateString()}
                                </Text>
                            </View>

                            <View className="mb-4 flex-row items-center">
                                <FontAwesome name="map-marker" size={16} color="#6b7280" />
                                <Text className="ml-2 text-gray-600">{event.location}</Text>
                            </View>

                            <Text className="leading-6 text-gray-700">{event.description}</Text>
                        </View>

                        {/* Stats */}
                        <View className="mb-6 flex-row space-x-4">
                            <View className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <Text className="text-2xl font-bold text-green-600">{checkedInCount}</Text>
                                <Text className="text-gray-600">Checked In</Text>
                            </View>

                            <View className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <Text className="text-2xl font-bold text-blue-600">{totalAttendees}</Text>
                                <Text className="text-gray-600">Total Attendees</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View className="mb-6 space-y-3">
                            <Button title="Scan QR Codes" className="w-full bg-green-500" />
                            <Button title="Export Attendee List" className="w-full" />
                        </View>

                        {/* Attendee List */}
                        <View>
                            <Text className="mb-3 text-lg font-semibold text-gray-800">Attendees</Text>
                            <View className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                {event.attendees.map((attendee, index) => (
                                    <View
                                        key={attendee.id}
                                        className={`flex-row items-center justify-between p-4 ${index < event.attendees.length - 1 ? 'border-b border-gray-100' : ''
                                            }`}>
                                        <View className="flex-1">
                                            <Text className="font-medium text-gray-800">{attendee.name}</Text>
                                            <Text className="text-sm text-gray-600">{attendee.email}</Text>
                                        </View>
                                        <View
                                            className={`rounded-full px-3 py-1 ${attendee.checked_in ? 'bg-green-100' : 'bg-gray-100'
                                                }`}>
                                            <Text
                                                className={`text-sm font-medium ${attendee.checked_in ? 'text-green-800' : 'text-gray-600'
                                                    }`}>
                                                {attendee.checked_in ? 'Checked In' : 'Pending'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Container>
        </>
    );
}
