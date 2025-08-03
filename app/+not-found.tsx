import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export default function NotFoundScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Oops!' });
  }, [navigation]);
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold">{"This screen doesn't exist."}</Text>

        <TouchableOpacity className="mt-4 pt-4" onPress={() => router.push('/')}>
          <Text className="text-base text-[#2e78b7]">Go to home screen!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
