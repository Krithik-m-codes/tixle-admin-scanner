import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';
import { RegisterFormData } from '../../src/types/forms';

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev: RegisterFormData) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const result = await signUp(formData);

      if (result.error) {
        Alert.alert('Registration Failed', result.error.message);
      } else {
        Alert.alert('Registration Successful', 'Please check your email to verify your account.', [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/login'),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-6">
            <View className="mb-8 items-center">
              <Text className="mb-2 text-3xl font-bold text-gray-900">Create Account</Text>
              <Text className="text-center text-gray-600">
                Join us and start discovering amazing events
              </Text>
            </View>

            <View className="mb-6 space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
                textContentType="name"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                textContentType="newPassword"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            <Button
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleRegister}
              disabled={isLoading}
              variant="primary"
              className="mb-6"
            />

            <View className="items-center">
              <Text className="text-gray-600">
                Already have an account?{' '}
                <Link href="/(auth)/login" className="font-semibold text-indigo-600">
                  Sign In
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
