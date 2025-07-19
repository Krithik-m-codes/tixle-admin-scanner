import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '~/utils/supabase';

export default function AuthCallback() {
    const router = useRouter();
    const { access_token, refresh_token } = useLocalSearchParams<{
        access_token?: string;
        refresh_token?: string;
    }>();

    useEffect(() => {
        if (access_token && refresh_token) {
            supabase.auth
                .setSession({
                    access_token,
                    refresh_token,
                })
                .then(({ error }) => {
                    if (error) {
                        console.error('Error setting session:', error);
                        router.replace('/(auth)');
                    } else {
                        router.replace('/(dashboard)');
                    }
                });
        } else {
            router.replace('/(auth)');
        }
    }, [access_token, refresh_token, router]);

    return (
        <View className="flex-1 items-center justify-center">
            <Text className="text-lg">Completing sign in...</Text>
        </View>
    );
}
