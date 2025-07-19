import { View, Text, Alert } from 'react-native';
import { useAuth } from '~/hooks/useAuth';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { signOut } from '~/utils/supabase';

export default function Profile() {
    const { user } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
        }
    };

    return (
        <Container>
            <View className="flex-1 p-6">
                <View className="mb-8 items-center">
                    <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-indigo-500">
                        <Text className="text-2xl font-bold text-white">
                            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text className="text-xl font-semibold text-gray-800">
                        {user?.user_metadata?.full_name || 'User'}
                    </Text>
                    <Text className="text-gray-600">{user?.email}</Text>
                </View>

                <View className="mb-8 space-y-4">
                    <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <Text className="mb-1 text-sm text-gray-500">Email</Text>
                        <Text className="text-gray-800">{user?.email}</Text>
                    </View>

                    <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <Text className="mb-1 text-sm text-gray-500">User ID</Text>
                        <Text className="font-mono text-xs text-gray-800">{user?.id}</Text>
                    </View>

                    <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <Text className="mb-1 text-sm text-gray-500">Account Created</Text>
                        <Text className="text-gray-800">
                            {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View className="space-y-3">
                    <Button title="Sign Out" onPress={handleSignOut} className="w-full bg-red-500" />
                </View>
            </View>
        </Container>
    );
}
