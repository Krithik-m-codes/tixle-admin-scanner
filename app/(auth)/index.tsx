import { View, Text } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useAuth } from '~/hooks/useAuth';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';

export default function AuthIndex() {
    const { user } = useAuth();

    // Redirect if already authenticated
    if (user) {
        return <Redirect href="/(dashboard)" />;
    }

    return (
        <Container>
            <View className="flex-1 items-center justify-center px-6">
                <View className="mb-12 items-center">
                    <Text className="mb-2 text-4xl font-bold text-gray-800">Tixle Admin</Text>
                    <Text className="text-center text-lg text-gray-600">
                        Event Management & QR Code Scanner
                    </Text>
                </View>

                <View className="w-full space-y-4">
                    <Link href="/login" asChild>
                        <Button title="Get Started" className="w-full" />
                    </Link>
                </View>

                <View className="mt-8">
                    <Text className="text-center text-sm text-gray-500">
                        Scan QR codes, manage events, and track attendees
                    </Text>
                </View>
            </View>
        </Container>
    );
}
