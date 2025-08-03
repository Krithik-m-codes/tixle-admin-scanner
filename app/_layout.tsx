import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { AdminLoadingScreen } from '../src/components/ui/AdminLoadingScreen';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isOnIndex = !segments[0]; // On index route

    if (session) {
      // User is signed in, redirect to admin dashboard if they're in auth or welcome
      if (inAuthGroup || isOnIndex) {
        router.replace('/(tabs)/dashboard');
      }
    } else {
      // User is not signed in, redirect to welcome if they're in protected areas
      if (inTabsGroup) {
        router.replace('/');
      }
    }
  }, [session, segments, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <AdminLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="(events)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
