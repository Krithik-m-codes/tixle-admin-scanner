import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';
import { LoginFormData } from '../../src/types/forms';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLoginScreen() {
  const { signIn, signInWithGoogle, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid admin email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev: LoginFormData) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev: Partial<LoginFormData>) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEmailSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await signIn(formData);

    if (result.error) {
      const errorMessage = result.error?.message || 'An error occurred during sign in';
      Alert.alert('Sign In Failed', errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();

    if (result.error) {
      Alert.alert('Google Sign In Failed', result.error?.message || 'An error occurred');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}>

          {/* Admin Header */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <Ionicons name="shield-checkmark" size={32} color="#4F46E5" />
            </View>
            <Text className="mb-2 text-3xl font-bold text-gray-900">Admin Portal</Text>
            <Text className="text-center text-gray-600">
              Sign in to access theater management system
            </Text>
          </View>

          <View className="mb-6 space-y-5">
            <Input
              label="Admin Email"
              placeholder="Enter your admin email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={errors.password}
              secureTextEntry
              autoComplete="current-password"
            />

            <Button
              title={isLoading ? 'Signing In...' : 'Sign In to Admin Panel'}
              onPress={handleEmailSignIn}
              disabled={isLoading}
              className="mt-2 bg-indigo-600"
            />
          </View>

          {/* Admin Features Info */}
          <View className="mb-6 rounded-lg bg-indigo-50 p-4">
            <Text className="mb-2 font-semibold text-indigo-900">Admin Features:</Text>
            <View className="space-y-1">
              <Text className="text-sm text-indigo-700">• QR Code Ticket Scanner</Text>
              <Text className="text-sm text-indigo-700">• Event Management</Text>
              <Text className="text-sm text-indigo-700">• Real-time Reports</Text>
              <Text className="text-sm text-indigo-700">• Emergency Alerts</Text>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-center text-sm text-gray-500">
              Restricted access for authorized theater staff only
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
