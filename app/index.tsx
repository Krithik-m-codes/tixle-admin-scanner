import { View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../src/components/ui/Button';

export default function WelcomeScreen() {
  const handleAdminLogin = () => {
    console.log('Admin Login button pressed');
    router.push('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header with Logo/Image */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-12 items-center">
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 128, height: 128, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text className="mb-4 text-4xl font-bold text-gray-900">Tixle Admin</Text>
          <Text className="px-4 text-center text-lg leading-7 text-gray-600">
            Theater Management System for ticket verification and event administration
          </Text>
        </View>

        {/* Admin Features */}
        <View className="mb-8 w-full space-y-4">
          <View className="rounded-lg bg-indigo-50 p-4">
            <Text className="mb-2 font-semibold text-indigo-900">🎫 Ticket Scanner</Text>
            <Text className="text-sm text-indigo-700">Verify ticket authenticity with QR code scanning</Text>
          </View>

          <View className="rounded-lg bg-green-50 p-4">
            <Text className="mb-2 font-semibold text-green-900">📊 Event Management</Text>
            <Text className="text-sm text-green-700">Manage events, attendees, and notifications</Text>
          </View>

          <View className="rounded-lg bg-purple-50 p-4">
            <Text className="mb-2 font-semibold text-purple-900">📈 Reports & Analytics</Text>
            <Text className="text-sm text-purple-700">Track performance and generate insights</Text>
          </View>
        </View>

        {/* Admin Login Button */}
        <View className="mb-6 w-full">
          <Button
            title="Admin Sign In"
            className="w-full py-4 bg-indigo-600"
            onPress={handleAdminLogin}
          />
        </View>

        {/* Footer Text */}
        <View className="items-center">
          <Text className="text-center text-sm text-gray-500">
            Secure admin portal for theater staff only
          </Text>
        </View>
      </View>
    </View>
  );
}
{/* <View className="mt-4">
  <Text className="px-8 text-center text-sm text-gray-500">
    By getting started, you agree to our Terms of Service and Privacy Policy
  </Text>
</View>
      </View >
    </View >
  );
} */}
