import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useEventStore } from '~/store/store';
import { Container } from '~/components/Container';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Events() {
    const { events } = useEventStore();

    const mockEvents = [
        {
            id: '1',
            name: 'Tech Conference 2025',
            date: '2025-02-15',
            location: 'Convention Center',
            description: 'Annual technology conference with industry leaders',
        },
        {
            id: '2',
            name: 'Music Festival',
            date: '2025-03-20',
            location: 'Central Park',
            description: 'Three-day music festival featuring local and international artists',
        },
        {
            id: '3',
            name: 'Food & Wine Expo',
            date: '2025-04-10',
            location: 'Exhibition Hall',
            description: 'Culinary showcase with tastings and cooking demonstrations',
        },
    ];

    const displayEvents = events.length > 0 ? events : mockEvents;

    return (
        <Container>
            <ScrollView className="flex-1">
                <View className="p-6">
                    <View className="mb-6 flex-row items-center justify-between">
                        <Text className="text-2xl font-bold text-gray-800">Events</Text>
                        <TouchableOpacity className="rounded-lg bg-indigo-500 px-4 py-2">
                            <Text className="font-medium text-white">Add Event</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-4">
                        {displayEvents.map((event) => (
                            <Link key={event.id} href={`/event/${event.id}`} asChild>
                                <TouchableOpacity className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1">
                                            <Text className="mb-1 text-lg font-semibold text-gray-800">{event.name}</Text>
                                            <View className="mb-2 flex-row items-center">
                                                <FontAwesome name="calendar" size={14} color="#6b7280" />
                                                <Text className="ml-2 text-gray-600">
                                                    {new Date(event.date).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <View className="mb-2 flex-row items-center">
                                                <FontAwesome name="map-marker" size={14} color="#6b7280" />
                                                <Text className="ml-2 text-gray-600">{event.location}</Text>
                                            </View>
                                            {event.description && (
                                                <Text className="text-sm text-gray-500" numberOfLines={2}>
                                                    {event.description}
                                                </Text>
                                            )}
                                        </View>
                                        <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>

                    {displayEvents.length === 0 && (
                        <View className="items-center py-12">
                            <FontAwesome name="calendar-o" size={48} color="#9ca3af" />
                            <Text className="mt-4 text-lg text-gray-500">No events found</Text>
                            <Text className="mt-2 text-center text-gray-400">
                                Create your first event to get started with attendee management
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </Container>
    );
}
