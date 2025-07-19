import '../global.css';

import { Stack } from 'expo-router';
import { useAuth } from '~/hooks/useAuth';
import { View, Text } from 'react-native';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // Authenticated stack
        <>
          <Stack.Screen name="(dashboard)" />
          <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
          <Stack.Screen name="event/[id]" />
        </>
      ) : (
        // Unauthenticated stack
        <>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="auth/callback" />
        </>
      )}
    </Stack>
  );
}
