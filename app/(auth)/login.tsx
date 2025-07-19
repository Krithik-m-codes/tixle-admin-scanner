import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '~/hooks/useAuth';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { signInWithGoogle } from '~/utils/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Login() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    if (user) {
        return <Redirect href="/(dashboard)" />;
    }

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <View className="flex-1 items-center justify-center px-6">
                <View className="mb-12 items-center">
                    <Text className="mb-2 text-3xl font-bold text-gray-800">Welcome Back</Text>
                    <Text className="text-center text-lg text-gray-600">
                        Sign in to access the admin panel
                    </Text>
                </View>

                <View className="w-full">
                    <Button
                        title={loading ? 'Signing in...' : 'Sign in with Google'}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex-row items-center justify-center bg-red-500">
                        <FontAwesome name="google" size={20} color="white" className="mr-2" />
                    </Button>
                </View>

                <View className="mt-8">
                    <Text className="text-center text-sm text-gray-500">
                        Use your Google account to access the event management system
                    </Text>
                </View>
            </View>
        </Container>
    );
}
