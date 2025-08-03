import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
    return (
        <SafeAreaView className={`flex-1 bg-gray-50 ${className}`}>
            <View className="flex-1">
                {children}
            </View>
        </SafeAreaView>
    );
}
