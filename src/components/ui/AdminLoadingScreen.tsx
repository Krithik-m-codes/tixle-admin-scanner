import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AdminLoadingScreenProps {
    message?: string;
}

export function AdminLoadingScreen({ message = 'Loading admin panel...' }: AdminLoadingScreenProps) {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 items-center justify-center p-6">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
                <Text className="text-center text-lg font-medium text-gray-700">{message}</Text>
                <Text className="mt-2 text-center text-sm text-gray-500">
                    Verifying admin credentials...
                </Text>
            </View>
        </SafeAreaView>
    );
}
