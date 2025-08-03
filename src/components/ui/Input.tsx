import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = 'outlined',
      size = 'md',
      required = false,
      containerStyle,
      style,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const hidePassword = secureTextEntry && !isPasswordVisible;

    const getContainerStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        marginBottom: 16,
      };

      return {
        ...baseStyle,
        ...containerStyle,
      };
    };

    const getInputContainerStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
      };

      const sizeStyles = {
        sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
        md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
        lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
      };

      const variantStyles = {
        default: {
          borderColor: error ? '#EF4444' : isFocused ? '#4F46E5' : '#E5E7EB',
          backgroundColor: '#FFFFFF',
        },
        outlined: {
          borderColor: error ? '#EF4444' : isFocused ? '#4F46E5' : '#D1D5DB',
          backgroundColor: '#FFFFFF',
        },
        filled: {
          borderColor: error ? '#EF4444' : 'transparent',
          backgroundColor: error ? '#FEF2F2' : isFocused ? '#F3F4F6' : '#F9FAFB',
        },
      };

      return {
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
      };
    };

    const getInputStyle = (): TextStyle => {
      const sizeStyles = {
        sm: { fontSize: 14 },
        md: { fontSize: 16 },
        lg: { fontSize: 18 },
      };

      return {
        flex: 1,
        color: '#111827',
        ...sizeStyles[size],
      };
    };

    const getLabelStyle = (): TextStyle => {
      return {
        fontSize: 14,
        fontWeight: '500',
        color: error ? '#EF4444' : '#374151',
        marginBottom: 6,
      };
    };

    const getErrorStyle = (): TextStyle => {
      return {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
      };
    };

    const getHintStyle = (): TextStyle => {
      return {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
      };
    };

    const iconSize = {
      sm: 16,
      md: 18,
      lg: 20,
    }[size];

    const iconColor = error ? '#EF4444' : isFocused ? '#4F46E5' : '#9CA3AF';

    const handlePasswordToggle = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const effectiveRightIcon = secureTextEntry
      ? isPasswordVisible
        ? 'eye-off'
        : 'eye'
      : rightIcon;

    const effectiveOnRightIconPress = secureTextEntry ? handlePasswordToggle : onRightIconPress;

    return (
      <View style={getContainerStyle()}>
        {label && (
          <Text style={getLabelStyle()}>
            {label}
            {required && <Text style={{ color: '#EF4444' }}> *</Text>}
          </Text>
        )}

        <View style={getInputContainerStyle()}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: 12 }}
            />
          )}

          <TextInput
            ref={ref}
            style={[getInputStyle(), style]}
            secureTextEntry={hidePassword}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholderTextColor="#9CA3AF"
            {...props}
          />

          {effectiveRightIcon && (
            <TouchableOpacity
              onPress={effectiveOnRightIconPress}
              style={{ padding: 4, marginLeft: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={effectiveRightIcon} size={iconSize} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={getErrorStyle()}>{error}</Text>}
        {hint && !error && <Text style={getHintStyle()}>{hint}</Text>}
      </View>
    );
  }
);
